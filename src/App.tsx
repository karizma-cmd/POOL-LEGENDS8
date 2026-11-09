/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PoolScene, CameraViewMode } from './game/scene';
import { 
  BallState, 
  GameMode, 
  MatchType, 
  AIDifficulty, 
  PlayerProfile, 
  TournamentMatch, 
  P2PMessage,
  TableSkin,
  TrajectoryPrediction
} from './game/types';
import { 
  createInitialRack, 
  areBallsAtRest, 
  strikeCueBall, 
  stepPhysics, 
  calculateTrajectory,
  stopAllBalls,
  BALL_RADIUS,
  TABLE_WIDTH,
  TABLE_LENGTH
} from './game/physics';
import { createInitialRulesState, evaluateShot, GameRulesState } from './game/rules';
import { computeAIShot, AI_PERSONAS, AIShotDecision } from './game/ai';
import { multiplayer } from './game/multiplayer';
import { storage } from './game/storage';
import { sounds } from './game/audio';
import { i18n } from './game/i18n';

// Components
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { SpinModal } from './components/SpinModal';
import { HotspotModal } from './components/HotspotModal';
import { TournamentModal } from './components/TournamentModal';
import { ShopModal } from './components/ShopModal';
import { ProfileModal } from './components/ProfileModal';
import { GameOverModal } from './components/GameOverModal';
import { MatchmakingModal } from './components/MatchmakingModal';
import { AvatarPickerModal } from './components/AvatarPickerModal';
import { PauseModal } from './components/PauseModal';

type GameScreen = 'title' | 'playing' | 'game_over';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PoolScene | null>(null);

  // Persistence State
  const [profile, setProfile] = useState<PlayerProfile>(() => storage.getProfile());
  const profileRef = useRef<PlayerProfile>(profile);
  profileRef.current = profile;

  // Game flow state
  const [screen, setScreen] = useState<GameScreen>('title');
  const [gameMode, setGameMode] = useState<GameMode>('8ball');
  const gameModeRef = useRef<GameMode>(gameMode);
  gameModeRef.current = gameMode;

  const [matchType, setMatchType] = useState<MatchType>('ai');
  const matchTypeRef = useRef<MatchType>(matchType);
  matchTypeRef.current = matchType;

  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('normal');
  const aiDifficultyRef = useRef<AIDifficulty>(aiDifficulty);
  aiDifficultyRef.current = aiDifficulty;

  const [opponentName, setOpponentName] = useState<string>('Sofia Reyes');
  const [opponentAvatar, setOpponentAvatar] = useState<string>('⚡');

  // Active game physics & rules state
  const ballsRef = useRef<BallState[]>([]);
  const rulesRef = useRef<GameRulesState>(createInitialRulesState('8ball'));
  const [hudState, setHudState] = useState({
    currentPlayerIndex: 0,
    isMyTurn: true,
    playerGroups: rulesRef.current.playerGroups,
    statusMessage: 'Break Shot: Take your opening break!',
    isBallInHand: false,
    balls: [] as BallState[],
  });

  // Aiming & Shooting state (kept in refs for rock-solid 60fps rendering without WebGL remounting)
  const aimAngleRef = useRef<number>(0);
  const [aimAngle, setAimAngle] = useState<number>(0);

  const powerRef = useRef<number>(0.5);
  const [power, setPower] = useState<number>(0.5);

  const spinOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spinOffset, setSpinOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastCuePosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0.5 });

  const [viewMode, setViewMode] = useState<CameraViewMode>('aim');
  const viewModeRef = useRef<CameraViewMode>(viewMode);
  viewModeRef.current = viewMode;

  // Match Stake state (1000, 2500, 50k, 1M)
  const [matchStake, setMatchStake] = useState<string>('2500');
  const [matchStakeAmount, setMatchStakeAmount] = useState<number>(2500);

  // Shot execution states
  const isAimingRef = useRef<boolean>(true);
  const isShootingAnimRef = useRef<boolean>(false);
  const strikeProgressRef = useRef<number>(0);
  const pottedBallIdsThisShotRef = useRef<number[]>([]);
  const firstContactBallIdRef = useRef<number | null>(null);
  const cushionHitsAfterContactRef = useRef<number>(0);
  const isAiThinkingRef = useRef<boolean>(false);
  const [showBallMarkers, setShowBallMarkers] = useState<boolean>(true);
  const [targetBallId, setTargetBallId] = useState<number | null>(null);
  const lastTargetBallIdRef = useRef<number | null>(null);
  const isDraggingCueBallRef = useRef<boolean>(false);

  // Modals state
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [isHotspotModalOpen, setIsHotspotModalOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);

  // Tournament bracket state
  const [tournamentRound, setTournamentRound] = useState<1 | 2 | 3>(1);
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>([
    { round: 1, matchIndex: 0, player1: { name: profile.name, avatar: profile.avatar, isUser: true }, player2: { name: 'Rookie Rick', avatar: '🧢', isUser: false }, winner: null },
    { round: 1, matchIndex: 1, player1: { name: 'Spike Miller', avatar: '🕶️', isUser: false }, player2: { name: 'Sofia Reyes', avatar: '⚡', isUser: false }, winner: null },
    { round: 1, matchIndex: 2, player1: { name: 'Marcus Chen', avatar: '🎯', isUser: false }, player2: { name: 'Boris Petrov', avatar: '🔨', isUser: false }, winner: null },
    { round: 1, matchIndex: 3, player1: { name: 'Jimmy Vance', avatar: '🎲', isUser: false }, player2: { name: 'Victoria Vance', avatar: '👑', isUser: false }, winner: null },
  ]);

  // Game over state
  const [gameOverDetails, setGameOverDetails] = useState({
    isVictory: false,
    winnerName: '',
    reason: '',
    coinsEarned: 0,
    xpEarned: 0,
  });

  // Pointer drag aiming
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const initialAngleOnPointerDownRef = useRef<number>(0);

  // Update power helper
  const handlePowerUpdate = useCallback((newPower: number) => {
    powerRef.current = newPower;
    setPower(newPower);
  }, []);

  // Update spin helper
  const handleSpinUpdate = useCallback((newSpin: { x: number; y: number }) => {
    spinOffsetRef.current = newSpin;
    setSpinOffset(newSpin);
  }, []);

  // Update aim angle helper
  const handleAimAngleUpdate = useCallback((newAngle: number) => {
    aimAngleRef.current = newAngle;
    setAimAngle(newAngle);

    if (matchTypeRef.current === 'hotspot_p2p') {
      multiplayer.sendMessage({
        type: 'SHOT_PREVIEW',
        senderId: profileRef.current.id,
        payload: { angle: newAngle, power: powerRef.current },
        timestamp: Date.now(),
      });
    }
  }, []);

  // 1. Initialize 3D Three.js Scene ONCE on mount with empty dependency array []
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new PoolScene(mountRef.current);
    sceneRef.current = scene;

    // Apply initial table and cue skins
    const tableSkins = storage.getTables();
    const activeTable = tableSkins.find(t => t.id === profileRef.current.selectedTableFelt) || tableSkins[0];
    scene.applyTableSkin(activeTable);

    const cuesCatalog = storage.getCues();
    const activeCue = cuesCatalog.find(c => c.id === profileRef.current.selectedCueId) || cuesCatalog[0];
    scene.applyCueItem(activeCue);

    // Initial rack
    const initialBalls = createInitialRack('8ball');
    ballsRef.current = initialBalls;
    scene.syncBalls(
      initialBalls, 
      profileRef.current.selectedBallSkin,
      rulesRef.current.playerGroups,
      rulesRef.current.currentPlayerIndex,
      gameModeRef.current,
      null,
      0.016
    );

    // Setup P2P Multiplayer listeners
    multiplayer.init({
      onStatusChange: (status, msg) => {
        if (msg) {
          setHudState(prev => ({ ...prev, statusMessage: msg }));
        }
      },
      onMessage: (msg: P2PMessage) => {
        handleP2PMessage(msg);
      },
      onPeerConnected: (role) => {
        setScreen('playing');
        setMatchType('hotspot_p2p');
        matchTypeRef.current = 'hotspot_p2p';
        setOpponentName(role === 'host' ? 'Friend (Guest)' : 'Friend (Host)');
        setOpponentAvatar('📱');
        resetMatch('8ball', 'hotspot_p2p');
      },
      onPeerDisconnected: () => {
        setHudState(prev => ({ ...prev, statusMessage: 'Peer connection disconnected.' }));
      },
    });

    // 2. Continuous 60 FPS Physics & Render Loop (Never torn down on pointer events)
    let lastTime = performance.now();
    let animId = 0;

    const gameLoop = (currentTime: number) => {
      animId = requestAnimationFrame(gameLoop);
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const balls = ballsRef.current;
      const currentScene = sceneRef.current;
      if (!currentScene || balls.length === 0) return;

      const cueBall = balls.find(b => b.id === 0);
      if (cueBall && !cueBall.inPocket) {
        lastCuePosRef.current = { x: cueBall.x, z: cueBall.z };
      }
      const cuePos = lastCuePosRef.current;

      // A. Strike Animation Progress
      if (isShootingAnimRef.current) {
        strikeProgressRef.current += dt * 6.0;
        if (strikeProgressRef.current >= 1.0) {
          isShootingAnimRef.current = false;
          strikeProgressRef.current = 0;
          isAimingRef.current = false;
        }
      }

      // B. Step Physics Simulation
      const events = stepPhysics(balls, dt);

      // Record first ball contact
      if (events.ballCollisions.length > 0 && firstContactBallIdRef.current === null) {
        const cueCollision = events.ballCollisions.find(c => c.ballA === 0 || c.ballB === 0);
        if (cueCollision) {
          firstContactBallIdRef.current = cueCollision.ballA === 0 ? cueCollision.ballB : cueCollision.ballA;
        }
      }

      // Record cushion hits
      if (events.cushionHits.length > 0 && firstContactBallIdRef.current !== null) {
        cushionHitsAfterContactRef.current += events.cushionHits.length;
      }

      // Record pocketed balls and award coins during gameplay
      if (events.pocketDrops.length > 0) {
        events.pocketDrops.forEach(pd => {
          if (!pottedBallIdsThisShotRef.current.includes(pd.ballId)) {
            pottedBallIdsThisShotRef.current.push(pd.ballId);

            // Award 50 coins immediately during gameplay when an object ball is pocketed!
            if (pd.ballId !== 0) {
              storage.addCoins(50);
              const updatedProfile = storage.getProfile();
              updatedProfile.ballsPottedTotal++;
              storage.saveProfile(updatedProfile);
              setProfile(updatedProfile);
              profileRef.current = updatedProfile;
            }
          }
        });
      }

      // C. Check if balls have come to complete rest
      const atRest = areBallsAtRest(balls);

      if (atRest && !isAimingRef.current && !isShootingAnimRef.current) {
        stopAllBalls(balls);
        const shotEval = evaluateShot(
          rulesRef.current,
          balls,
          pottedBallIdsThisShotRef.current,
          firstContactBallIdRef.current,
          cushionHitsAfterContactRef.current
        );

        rulesRef.current = shotEval.newState;
        pottedBallIdsThisShotRef.current = [];
        firstContactBallIdRef.current = null;
        cushionHitsAfterContactRef.current = 0;
        isAimingRef.current = true;

        if (shotEval.result.gameOver) {
          handleGameOver(shotEval.result.winnerPlayerIndex === 0);
        } else {
          const currentIdx = rulesRef.current.currentPlayerIndex;
          const currentMatchType = matchTypeRef.current;
          const isMyTurn = (currentMatchType === 'ai' || currentMatchType === 'solo')
            ? currentIdx === 0
            : (currentMatchType === 'hotspot_p2p' ? (multiplayer.getRole() === 'host' ? currentIdx === 0 : currentIdx === 1) : true);

          setHudState({
            currentPlayerIndex: currentIdx,
            isMyTurn,
            playerGroups: rulesRef.current.playerGroups,
            statusMessage: rulesRef.current.statusMessage,
            isBallInHand: rulesRef.current.isBallInHand,
            balls: [...balls],
          });

          if (currentMatchType === 'ai' && currentIdx === 1 && !isAiThinkingRef.current) {
            triggerAITurn();
          }
        }
      }

      // D. Trajectory Raycast Prediction
      const cuesCatalog = storage.getCues();
      const currentCue = cuesCatalog.find(c => c.id === profileRef.current.selectedCueId) || cuesCatalog[0];
      const trajectory = calculateTrajectory(balls, aimAngleRef.current, 0.7 + currentCue.aimLength * 0.15);

      if (trajectory.targetBallId !== lastTargetBallIdRef.current) {
        lastTargetBallIdRef.current = trajectory.targetBallId;
        setTargetBallId(trajectory.targetBallId);
      }

      // E. Update 3D Scene Ball Meshes & Cue
      currentScene.syncBalls(
        balls, 
        profileRef.current.selectedBallSkin,
        rulesRef.current.playerGroups,
        rulesRef.current.currentPlayerIndex,
        gameModeRef.current,
        trajectory.targetBallId,
        dt
      );
      currentScene.updateAim(
        cuePos,
        aimAngleRef.current,
        powerRef.current,
        trajectory,
        isAimingRef.current,
        isShootingAnimRef.current,
        strikeProgressRef.current,
        rulesRef.current.isBallInHand
      );

      // F. Smooth Camera Damping (Automatic dynamic overhead view on shot, over-the-cue when aiming)
      currentScene.updateCamera(cuePos, dt, isAimingRef.current);

      // G. Render frame smoothly in lockstep!
      currentScene.render();
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      scene.dispose();
      multiplayer.close();
    };
  }, []); // EMPTY ARRAY: mounted once, never torn down by state changes!

  // Handle incoming P2P multiplayer messages
  const handleP2PMessage = useCallback((msg: P2PMessage) => {
    if (msg.type === 'SHOT_PREVIEW') {
      aimAngleRef.current = msg.payload.angle;
      powerRef.current = msg.payload.power;
      setAimAngle(msg.payload.angle);
      setPower(msg.payload.power);
    } else if (msg.type === 'SHOT_EXECUTE') {
      aimAngleRef.current = msg.payload.angle;
      powerRef.current = msg.payload.power;
      setAimAngle(msg.payload.angle);
      setPower(msg.payload.power);
      executeShot(msg.payload.angle, msg.payload.power, msg.payload.spinOffset);
    } else if (msg.type === 'SYNC_BALLS') {
      if (msg.payload.balls && Array.isArray(msg.payload.balls)) {
        ballsRef.current = msg.payload.balls;
      }
    } else if (msg.type === 'BALL_IN_HAND') {
      const cue = ballsRef.current.find(b => b.id === 0);
      if (cue && msg.payload) {
        cue.x = msg.payload.x;
        cue.z = msg.payload.z;
        cue.y = BALL_RADIUS;
        cue.inPocket = false;
      }
    }
  }, []);

  // Lifelike human AI animation references
  const aiAnimRef = useRef<number | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAiAnimation = () => {
    if (aiAnimRef.current) {
      cancelAnimationFrame(aiAnimRef.current);
      aiAnimRef.current = null;
    }
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    isAiThinkingRef.current = false;
  };

  // Trigger offline AI shot with lifelike, smooth human execution
  const triggerAITurn = () => {
    if (isAiThinkingRef.current) return;
    clearAiAnimation();
    isAiThinkingRef.current = true;

    const isAr = i18n.getLanguage() === 'ar';
    setHudState(prev => ({ 
      ...prev, 
      statusMessage: isAr ? `${opponentName} يدرس وضعية الطاولة...` : `${opponentName} is studying the table...` 
    }));

    // Step 1: Human thinking/deliberation pause (600-850ms)
    aiTimeoutRef.current = setTimeout(() => {
      const aiDecision = computeAIShot(
        ballsRef.current,
        gameModeRef.current,
        rulesRef.current.playerGroups[1],
        aiDifficultyRef.current,
        rulesRef.current.isBreakShot,
        rulesRef.current.isBallInHand
      );

      // Handle ball-in-hand placement smoothly if needed
      if (aiDecision.isBallInHandPlacement) {
        const cue = ballsRef.current.find(b => b.id === 0);
        if (cue) {
          cue.x = aiDecision.isBallInHandPlacement.x;
          cue.z = aiDecision.isBallInHandPlacement.z;
          cue.inPocket = false;
          rulesRef.current.isBallInHand = false;
        }
      }

      // Step 2: Smooth human cue panning (sweep aim angle from current angle to target)
      const startAngle = aimAngleRef.current;
      const targetAngle = aiDecision.angle;
      let angleDiff = targetAngle - startAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const aimDuration = Math.min(1300, Math.max(700, Math.abs(angleDiff) * 600));
      const startTime = performance.now();

      setHudState(prev => ({ 
        ...prev, 
        statusMessage: isAr ? `${opponentName} يوجّه العصا نحو الهدف...` : `${opponentName} is lining up the shot...` 
      }));

      const animateAim = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / aimDuration);
        // Smooth easeInOutCubic curve (starts smoothly, accelerates, decelerates into pocket line)
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentAngle = startAngle + angleDiff * ease;
        aimAngleRef.current = currentAngle;
        setAimAngle(currentAngle);

        if (progress < 1) {
          aiAnimRef.current = requestAnimationFrame(animateAim);
        } else {
          // Lock target angle and spin
          aimAngleRef.current = targetAngle;
          setAimAngle(targetAngle);
          spinOffsetRef.current = aiDecision.spinOffset;
          setSpinOffset(aiDecision.spinOffset);

          // Step 3: Human warm-up cue feathering & smooth pull-back
          animateCueFeathering(aiDecision);
        }
      };

      aiAnimRef.current = requestAnimationFrame(animateAim);
    }, 700);
  };

  // Human feathering stroke & smooth pull-back
  const animateCueFeathering = (aiDecision: AIShotDecision) => {
    const isAr = i18n.getLanguage() === 'ar';
    setHudState(prev => ({ 
      ...prev, 
      statusMessage: isAr ? `${opponentName} يسحب العصا للتسديد...` : `${opponentName} is drawing back the cue...` 
    }));

    const targetPower = aiDecision.power;
    const featherTime = performance.now();
    const pumpDuration = 380;
    const finalDrawDuration = 420;

    const animateStrokes = (now: number) => {
      const elapsed = now - featherTime;

      if (elapsed < pumpDuration) {
        // Feathering pump: smoothly draw back to ~30% of power, then push forward
        const pProgress = elapsed / pumpDuration;
        const pumpVal = Math.sin(pProgress * Math.PI) * Math.min(0.28, targetPower * 0.5);
        powerRef.current = pumpVal;
        setPower(pumpVal);
        aiAnimRef.current = requestAnimationFrame(animateStrokes);
      } else if (elapsed < pumpDuration + finalDrawDuration) {
        // Smooth final draw directly to target power
        const drawProgress = (elapsed - pumpDuration) / finalDrawDuration;
        const easeDraw = 1 - (1 - drawProgress) * (1 - drawProgress);
        const currentP = targetPower * easeDraw;
        powerRef.current = currentP;
        setPower(currentP);
        aiAnimRef.current = requestAnimationFrame(animateStrokes);
      } else {
        // Set final power firmly
        powerRef.current = targetPower;
        setPower(targetPower);

        // Natural split-second breath pause (120ms) then crisp release strike!
        aiTimeoutRef.current = setTimeout(() => {
          executeShot(aiDecision.angle, aiDecision.power, aiDecision.spinOffset);
          isAiThinkingRef.current = false;
        }, 120);
      }
    };

    aiAnimRef.current = requestAnimationFrame(animateStrokes);
  };

  // Execute shot on cue ball with physics impulse
  const executeShot = (
    shotAngle = aimAngleRef.current,
    shotPower = powerRef.current,
    shotSpin = spinOffsetRef.current
  ) => {
    const cueBall = ballsRef.current.find(b => b.id === 0);
    if (!cueBall || !isAimingRef.current || isShootingAnimRef.current) return;

    isShootingAnimRef.current = true;
    strikeProgressRef.current = 0;
    pottedBallIdsThisShotRef.current = [];
    firstContactBallIdRef.current = null;
    cushionHitsAfterContactRef.current = 0;

    // Calculate multipliers based on equipped cue stats
    const cuesCatalog = storage.getCues();
    const currentCue = cuesCatalog.find(c => c.id === profileRef.current.selectedCueId) || cuesCatalog[0];
    const powerMultiplier = 0.85 + (currentCue.power || 2) * 0.07;
    const spinMultiplier = 0.85 + (currentCue.spinControl || 2) * 0.07;

    // Apply impulse to cue ball
    strikeCueBall(cueBall, shotAngle, shotPower * powerMultiplier, {
      x: shotSpin.x * spinMultiplier,
      y: shotSpin.y * spinMultiplier,
    });

    // If multiplayer, send shot execution over P2P DataChannel
    if (matchTypeRef.current === 'hotspot_p2p') {
      multiplayer.sendMessage({
        type: 'SHOT_EXECUTE',
        senderId: profileRef.current.id,
        payload: { angle: shotAngle, power: shotPower, spinOffset: shotSpin },
        timestamp: Date.now(),
      });
    }

    powerRef.current = 0.5;
    setPower(0.5);
  };

  // Reset match for new game
  const resetMatch = (mode: GameMode, type: MatchType, diff: AIDifficulty = 'normal') => {
    setGameMode(mode);
    gameModeRef.current = mode;
    setMatchType(type);
    matchTypeRef.current = type;
    setAiDifficulty(diff);
    aiDifficultyRef.current = diff;

    const initialBalls = createInitialRack(mode);
    ballsRef.current = initialBalls;
    rulesRef.current = createInitialRulesState(mode);

    if (type === 'ai') {
      const persona = AI_PERSONAS[diff];
      setOpponentName(persona.name);
      setOpponentAvatar(persona.avatar);
    }

    setHudState({
      currentPlayerIndex: 0,
      isMyTurn: true,
      playerGroups: ['unassigned', 'unassigned'],
      statusMessage: 'Break Shot: Take your opening break!',
      isBallInHand: false,
      balls: [...initialBalls],
    });

    isAimingRef.current = true;
    isShootingAnimRef.current = false;
    clearAiAnimation();
    aimAngleRef.current = 0;
    powerRef.current = 0.5;
    setAimAngle(0);
    setPower(0.5);
    setViewMode('aim');
    viewModeRef.current = 'aim';
    setScreen('playing');

    if (sceneRef.current) {
      sceneRef.current.onResize();
      sceneRef.current.viewMode = 'aim';
      sceneRef.current.syncBalls(
        initialBalls, 
        profileRef.current.selectedBallSkin,
        rulesRef.current.playerGroups,
        0,
        mode,
        null,
        0.016
      );
      sceneRef.current.snapCamera();
    }
  };

  // Game over handler - player wins DOUBLE their bet money!
  const handleGameOver = (isUserWinner: boolean) => {
    clearAiAnimation();
    const coinsWon = isUserWinner ? (matchStakeAmount * 2) : 0;
    const xpWon = isUserWinner ? 100 : 25;

    storage.addCoins(coinsWon);
    storage.addXP(xpWon);

    const updatedProfile = storage.getProfile();
    if (isUserWinner) {
      updatedProfile.matchesWon++;
      updatedProfile.currentStreak++;
      if (updatedProfile.currentStreak > updatedProfile.highestStreak) {
        updatedProfile.highestStreak = updatedProfile.currentStreak;
      }
    } else {
      updatedProfile.matchesLost++;
      updatedProfile.currentStreak = 0;
    }
    storage.saveProfile(updatedProfile);
    setProfile(updatedProfile);

    setGameOverDetails({
      isVictory: isUserWinner,
      winnerName: isUserWinner ? profileRef.current.name : opponentName,
      reason: rulesRef.current.statusMessage,
      coinsEarned: coinsWon,
      xpEarned: xpWon,
    });
    setScreen('game_over');
  };

  // Pointer drag to aim on the 3D canvas or interactively drag/place cue ball by hand automatically
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const hit = sceneRef.current?.getTableIntersection(e.clientX, e.clientY);
    const cue = ballsRef.current.find(b => b.id === 0);

    // Cue ball can ONLY be repositioned by hand if it fell into a pocket (scratch / ball-in-hand)
    if (hudState.isMyTurn && isAimingRef.current && hit && cue && !cue.inPocket && rulesRef.current.isBallInHand) {
      const minX = -TABLE_WIDTH / 2 + BALL_RADIUS * 1.8;
        const maxX = TABLE_WIDTH / 2 - BALL_RADIUS * 1.8;
        const minZ = -TABLE_LENGTH / 2 + BALL_RADIUS * 1.8;
        const maxZ = TABLE_LENGTH / 2 - BALL_RADIUS * 1.8;

        const targetX = Math.max(minX, Math.min(maxX, hit.x));
        const targetZ = Math.max(minZ, Math.min(maxZ, hit.z));

        const isOverlapping = ballsRef.current.some(b => {
          if (b.id === 0 || b.inPocket) return false;
          const dx = b.x - targetX;
          const dz = b.z - targetZ;
          return dx * dx + dz * dz < (BALL_RADIUS * 2.1) * (BALL_RADIUS * 2.1);
        });

        if (!isOverlapping) {
          cue.x = targetX;
          cue.z = targetZ;
          cue.y = BALL_RADIUS;
          cue.vx = 0;
          cue.vz = 0;
          cue.inPocket = false;
          cue.pocketDropProgress = 0;
          isDraggingCueBallRef.current = true;
          sounds.playClick();

          if (matchTypeRef.current === 'hotspot_p2p') {
            multiplayer.sendMessage({
              type: 'BALL_IN_HAND',
              senderId: profileRef.current.id,
              payload: { x: targetX, z: targetZ },
              timestamp: Date.now(),
            });
          }
        }

        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
        return;
      }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    initialAngleOnPointerDownRef.current = aimAngleRef.current;
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // 1. Dragging cue ball by hand automatically
    if (isDraggingCueBallRef.current && hudState.isMyTurn) {
      const hit = sceneRef.current?.getTableIntersection(e.clientX, e.clientY);
      if (hit) {
        const minX = -TABLE_WIDTH / 2 + BALL_RADIUS * 1.8;
        const maxX = TABLE_WIDTH / 2 - BALL_RADIUS * 1.8;
        const minZ = -TABLE_LENGTH / 2 + BALL_RADIUS * 1.8;
        const maxZ = TABLE_LENGTH / 2 - BALL_RADIUS * 1.8;

        const targetX = Math.max(minX, Math.min(maxX, hit.x));
        const targetZ = Math.max(minZ, Math.min(maxZ, hit.z));

        const isOverlapping = ballsRef.current.some(b => {
          if (b.id === 0 || b.inPocket) return false;
          const dx = b.x - targetX;
          const dz = b.z - targetZ;
          return dx * dx + dz * dz < (BALL_RADIUS * 2.1) * (BALL_RADIUS * 2.1);
        });

        if (!isOverlapping) {
          const cue = ballsRef.current.find(b => b.id === 0);
          if (cue) {
            cue.x = targetX;
            cue.z = targetZ;
            cue.y = BALL_RADIUS;
            cue.inPocket = false;

            if (matchTypeRef.current === 'hotspot_p2p') {
              multiplayer.sendMessage({
                type: 'BALL_IN_HAND',
                senderId: profileRef.current.id,
                payload: { x: targetX, z: targetZ },
                timestamp: Date.now(),
              });
            }
          }
        }
      }
      return;
    }

    // 2. Aiming angle rotation or 3D camera orbit
    if (!pointerDownPosRef.current || !isAimingRef.current) return;

    if (viewModeRef.current === 'free' && sceneRef.current) {
      const dx = e.clientX - pointerDownPosRef.current.x;
      const dy = e.clientY - pointerDownPosRef.current.y;
      sceneRef.current.orbitAngleX += dx * 0.008;
      sceneRef.current.orbitAngleY = Math.max(0.2, Math.min(1.4, sceneRef.current.orbitAngleY + dy * 0.008));
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      const dx = e.clientX - pointerDownPosRef.current.x;
      const newAngle = initialAngleOnPointerDownRef.current + dx * 0.005;
      handleAimAngleUpdate(newAngle);
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    // Automatically lock and place ball when hand releases it!
    if (isDraggingCueBallRef.current) {
      isDraggingCueBallRef.current = false;
      rulesRef.current.isBallInHand = false;
      sounds.playBallHit(0.4);
      setHudState(prev => ({
        ...prev,
        isBallInHand: false,
        statusMessage: 'Ready! Adjust angle and strike.',
        balls: [...ballsRef.current],
      }));
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    pointerDownPosRef.current = null;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          sounds.playClick();
          resetMatch('8ball', 'ai', aiDifficultyRef.current);
        }
        return;
      }

      if (screen === 'playing' && isAimingRef.current) {
        if (e.code === 'ArrowLeft') {
          handleAimAngleUpdate(aimAngleRef.current - 0.02);
        } else if (e.code === 'ArrowRight') {
          handleAimAngleUpdate(aimAngleRef.current + 0.02);
        } else if (e.code === 'Space' || e.code === 'Enter') {
          executeShot();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, handleAimAngleUpdate]);

  // Ensure 3D viewport matches exact screen size without black flicker when entering game
  useEffect(() => {
    if (screen === 'playing') {
      const t1 = setTimeout(() => {
        sceneRef.current?.onResize();
      }, 30);
      const t2 = setTimeout(() => {
        sceneRef.current?.onResize();
      }, 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [screen]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-['Outfit',sans-serif]">
      {/* 1. Dedicated 3D Three.js WebGL Mount (Isolated canvas container, never torn down) */}
      <div
        ref={mountRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        onWheel={(e) => {
          if (e.deltaY > 0) {
            sceneRef.current?.zoomOut();
          } else {
            sceneRef.current?.zoomIn();
          }
        }}
        className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none transition-opacity duration-300 ${
          screen === 'playing' ? 'z-10 opacity-100 pointer-events-auto' : 'z-0 opacity-100 pointer-events-none'
        }`}
      />

      {/* 2. Title Screen */}
      {screen === 'title' && (
        <TitleScreen
          profile={profile}
          onStartMatch={(mode, type, diff) => {
            if (type === 'ai') {
              setIsMatchmakingOpen(true);
            } else {
              resetMatch(mode, type, diff || 'normal');
            }
          }}
          onOpenHotspot={() => setIsHotspotModalOpen(true)}
          onOpenTournament={() => setIsTournamentModalOpen(true)}
          onOpenShop={() => setIsShopModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
        />
      )}

      {/* 3. In-Game Low-Occlusion HUD */}
      {screen === 'playing' && (
        <HUD
          mode={gameMode}
          matchType={matchType}
          profile={profile}
          opponentName={opponentName}
          opponentAvatar={opponentAvatar}
          currentPlayerIndex={hudState.currentPlayerIndex}
          isMyTurn={hudState.isMyTurn}
          playerGroups={hudState.playerGroups}
          balls={hudState.balls}
          statusMessage={hudState.statusMessage}
          isBallInHand={hudState.isBallInHand}
          power={power}
          onPowerChange={handlePowerUpdate}
          onShoot={() => executeShot()}
          onFineAngleAdjust={(delta) => handleAimAngleUpdate(aimAngleRef.current + delta)}
          viewMode={viewMode}
          onViewModeChange={(vm) => {
            setViewMode(vm);
            viewModeRef.current = vm;
            if (sceneRef.current) sceneRef.current.viewMode = vm;
          }}
          onOpenSpinModal={() => setIsSpinModalOpen(true)}
          onOpenShop={() => setIsShopModalOpen(true)}
          onPauseMatch={() => setIsPauseModalOpen(true)}
          targetBallId={targetBallId}
          showBallMarkers={showBallMarkers}
          stakeDisplay={matchStake}
        />
      )}

      {/* 4. Match Over Modal */}
      <GameOverModal
        isOpen={screen === 'game_over'}
        isVictory={gameOverDetails.isVictory}
        winnerName={gameOverDetails.winnerName}
        reason={gameOverDetails.reason}
        coinsEarned={gameOverDetails.coinsEarned}
        xpEarned={gameOverDetails.xpEarned}
        onRematch={() => resetMatch(gameMode, matchType, aiDifficulty)}
        onMainMenu={() => {
          clearAiAnimation();
          setScreen('title');
        }}
      />

      {/* 4b. In-Game Pause Menu Modal (Exit or Replay options) */}
      <PauseModal
        isOpen={isPauseModalOpen}
        onResume={() => setIsPauseModalOpen(false)}
        onReplay={() => {
          setIsPauseModalOpen(false);
          resetMatch(gameMode, matchType, aiDifficulty);
        }}
        onExit={() => {
          clearAiAnimation();
          setIsPauseModalOpen(false);
          setScreen('title');
        }}
      />

      {/* 5. Cue Ball Spin Modal */}
      <SpinModal
        isOpen={isSpinModalOpen}
        onClose={() => setIsSpinModalOpen(false)}
        spinOffset={spinOffset}
        onSpinChange={handleSpinUpdate}
      />

      {/* 6. Offline Local Hotspot Multiplayer Modal */}
      <HotspotModal
        isOpen={isHotspotModalOpen}
        onClose={() => setIsHotspotModalOpen(false)}
        onStartHotspotGame={(role) => {
          setMatchType('hotspot_p2p');
          matchTypeRef.current = 'hotspot_p2p';
          setOpponentName(role === 'host' ? 'Friend (Guest)' : 'Friend (Host)');
          setOpponentAvatar('📱');
          resetMatch('8ball', 'hotspot_p2p');
        }}
        onStartPassAndPlay={(p1, p2) => {
          setMatchType('pass_and_play');
          matchTypeRef.current = 'pass_and_play';
          setOpponentName(p2 || 'Player 2');
          setOpponentAvatar('🎱');
          resetMatch('8ball', 'pass_and_play');
        }}
      />

      {/* 7. Tournament Bracket Cup Modal */}
      <TournamentModal
        isOpen={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        profile={profile}
        currentRound={tournamentRound}
        matches={tournamentMatches}
        onStartTournamentMatch={(oppName, round) => {
          setOpponentName(oppName);
          setOpponentAvatar('🏆');
          resetMatch('8ball', 'ai', round === 1 ? 'easy' : round === 2 ? 'normal' : 'pro');
        }}
      />

      {/* 8. Pro Shop Modal */}
      <ShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        profile={profile}
        onProfileUpdate={(updated) => {
          setProfile(updated);
          profileRef.current = updated;
          const cuesCatalog = storage.getCues();
          const equippedCue = cuesCatalog.find(c => c.id === updated.selectedCueId);
          if (equippedCue && sceneRef.current) sceneRef.current.applyCueItem(equippedCue);
        }}
        onTableChange={(table) => {
          if (sceneRef.current) sceneRef.current.applyTableSkin(table);
        }}
      />

      {/* 9. Player Career Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onProfileUpdate={(updated) => {
          setProfile(updated);
          profileRef.current = updated;
        }}
      />

      {/* 10. Random Opponent Slots Matchmaking Modal */}
      <MatchmakingModal
        isOpen={isMatchmakingOpen}
        onClose={() => setIsMatchmakingOpen(false)}
        userProfile={profile}
        onConfirmOpponent={(opp, stakeLabel, stakeAmount) => {
          setIsMatchmakingOpen(false);
          setMatchStake(stakeLabel);
          setMatchStakeAmount(stakeAmount);
          setOpponentName(opp.nameAr);
          setOpponentAvatar(opp.avatar);
          resetMatch('8ball', 'ai', opp.difficulty);
        }}
      />

      {/* 11. Cartoon Character Avatar Thumbnail Picker */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        profile={profile}
        onProfileUpdate={(updated) => {
          setProfile(updated);
          profileRef.current = updated;
        }}
      />
    </div>
  );
}
