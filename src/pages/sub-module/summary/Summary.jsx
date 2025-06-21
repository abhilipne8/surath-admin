import React, { useEffect, useRef, useState } from 'react';
import { useHMSActions, useHMSStore, selectPeers, HMSRoomProvider } from '@100mslive/react-sdk';
import './Summary.css';
import api from '../../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { drawResult, fetchSessionbetAmount, fetchSessionInfo, fetchSurathSettings, gameModeChange, setEndTime, updateSessionId } from '../../../store/surath/surath';
import umbrella from './../../../assets/umbrella.svg';
import football from './../../../assets/football.svg';
import sun from './../../../assets/sun.svg';
import oilLamp from './../../../assets/oil-lamp.svg';
import cow from './../../../assets/cow.svg';
import bucket from './../../../assets/bucket.svg';
import kite from './../../../assets/kite.svg';
import spinner from './../../../assets/spinner.svg';
import rose from './../../../assets/rose.svg';
import butterfly from './../../../assets/butterfly.svg';
import hope from './../../../assets/hope.svg';
import rabbit from './../../../assets/rabbit.svg';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
// import beepSound from '../../../../public/car-beeping-1.mp3'

const socket = io(import.meta.env.VITE_SOCKET_API_URL);

const Summary = React.memo(() => {
    const hmsActions = useHMSActions();
    const [isStreaming, setIsStreaming] = useState(false);
    const peers = useHMSStore(selectPeers);
    const [selectedMode, setSelectedMode] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const dispatch = useDispatch()
    const { settings, loading, error, resultLoading, endTime, sessionId } = useSelector((state) => state.surath)
    const [timer, SetTimer] = useState()
    const [camera, setCamera] = useState('back'); // State to keep track of the current camera
    const audioRef = useRef(null);
    const hasFetchedRef = useRef(false);
    const [sessionbetAmount, SetSessionbetAmount] = useState(null)

    const cardData = [
        { id: 'UMBRELLA', image: umbrella },
        { id: 'FOOTBALL', image: football },
        { id: 'SUN', image: sun },
        { id: 'OIL_LAMP', image: oilLamp },
        { id: 'COW', image: cow },
        { id: 'BUCKET', image: bucket },
        { id: 'KITE', image: kite },
        { id: 'SPINNER', image: spinner },
        { id: 'ROSE', image: rose },
        { id: 'BUTTERFLY', image: butterfly },
        { id: 'HOPE', image: hope },
        { id: 'RABBIT', image: rabbit },
    ];

    const startClass = async () => {
        try {
            const response = await api.post('/live/admin/generate-token');
            if (response.data.token) {
                await hmsActions.join({
                    authToken: response.data.token,
                    userName: 'Admin',
                });
                await hmsActions.setLocalVideoEnabled(true);
                setIsStreaming(true);
            }
        } catch (error) {
            console.error("Failed to start the class:", error);
            alert("Unable to start the live class. Please try again.");
        }
    };

    const cancelClass = async () => {
        try {
            await hmsActions.leave();
            setIsStreaming(false);
        } catch (error) {
            console.error("Failed to leave the class:", error);
        }
    };

    const switchCamera = async () => {
        try {
            // Check if the device is mobile
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
            // If the user is on mobile, switch to back camera
            if (isMobile) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back'));
    
                if (backCamera) {
                    // Get user media for back camera
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: backCamera.deviceId } }
                    });
    
                    const newTrack = stream.getVideoTracks()[0];
                    await hmsActions.replaceLocalVideoTrack(newTrack);
                    console.log("Switched to back camera");
                } else {
                    throw new Error("Back camera not found.");
                }
            }
        } catch (error) {
            console.error("Error while switching camera: ", error);
            toast.error("Unable to switch camera. Please try again.");
        }
    };

    useEffect(() => {
        dispatch(fetchSurathSettings())
        dispatch(fetchSessionInfo())
    }, [dispatch]);

    useEffect(() => {
        if (settings?.sessionMode) {
            setSelectedMode(settings.sessionMode); // Update selected mode based on settings
        }
    }, [settings]);

    const handleModeChange = (event) => {
        dispatch(gameModeChange(event.target.value))
        .unwrap()
        .then((result) => {
            setSelectedMode(event.target.value);
            toast.success(result.message,{
                position: 'top-right',
                autoClose: 3000,
              })
        })
        .catch((error) => {
            toast.success(error.message,{
                position: 'top-right',
                autoClose: 3000,
              })
        })
    };

    const handleCardSelect = (id) => {
        setSelectedCard(id);
    };

    const handleCardSubmit = () => {
        if (selectedCard) {
            console.log("Selected Card:", selectedCard);
            dispatch(drawResult(selectedCard))
            .unwrap()
            .then((result) => {
                setSelectedCard(null)
                toast.success(result.message,{
                    position: 'top-right',
                    autoClose: 3000,
                  })
            })
            .catch((error) => {
                toast.success(error.message,{
                    position: 'top-right',
                    autoClose: 3000,
                  })
            })
        } else {
            alert("Please select a card before proceeding.");
        }
    };

    useEffect(() => {
        // Timer calculation logic
        const calculateRemainingTime = () => {
            if (endTime) {
                const now = Date.now();
                const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
                SetTimer(timeLeft);

                if (timeLeft === 0 && !hasFetchedRef.current) {
                    hasFetchedRef.current = true; // Ensure it's called only once
                    console.log("ABhi =>", sessionId)
                    dispatch(fetchSessionbetAmount(sessionId))
                    .unwrap()
                    .then((data) => {
                      SetSessionbetAmount(data.bets)
                    })
                }

                if (timeLeft > 0 && hasFetchedRef.current) {
                    hasFetchedRef.current = false; // Reset if a new session starts
                }
            }
        };

        calculateRemainingTime();
        const intervalId = setInterval(calculateRemainingTime, 1000);

        return () => clearInterval(intervalId);
    }, [endTime]);

    useEffect(() => {
        const handleSessionStarted = (sessionData) => {
          dispatch(updateSessionId(sessionData.sessionId))
          const newEndTime = new Date(sessionData.endTime).getTime();
          SetSessionbetAmount([])
          dispatch(setEndTime(newEndTime))
        };
      
        socket.on("sessionStarted", handleSessionStarted);
      
        return () => {
          socket.off("sessionStarted", handleSessionStarted);
        };
      }, []);

    return (
        <div className="summary-container row">
         {/* <audio ref={audioRef} src={beepSound} preload="auto" /> */}
            <div className="col-md-6 col-12 text-center">
                <div className="video-grid">
                    {peers.map((peer) => (
                        <div key={peer.id} className="video-container">
                            <video
                                autoPlay
                                muted={peer.isLocal}
                                ref={(ref) => {
                                    if (ref && peer.videoTrack) {
                                        hmsActions.attachVideo(peer.videoTrack, ref);
                                    }
                                }}
                            ></video>
                        </div>
                    ))}
                </div>
                <div className="action-buttons mt-2">
                    {!isStreaming ? (
                        <button className="btn btn-success" onClick={startClass}>
                            Start Live
                        </button>
                    ) : (
                        <button className="btn btn-danger" onClick={cancelClass}>
                            Stop Live
                        </button>
                    )}
                </div>
                {isStreaming && (
                    <div className="mt-2">
                        <button className="btn btn-secondary" onClick={switchCamera}>
                            Switch Camera (Front/Back)
                        </button>
                    </div>
                )}
                <div className='mt-4'>
                    <h3>Session Mode</h3>
                    {loading && <p>Loading settings...</p>}
                    {error && <p className="text-danger">Error: {error}</p>}
                    {selectedMode ? (
                        <div className='d-flex justify-content-center mt-3'>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sessionMode"
                                    id="automaticMode"
                                    value="automatic"
                                    checked={selectedMode === 'automatic'}
                                    onChange={handleModeChange}
                                />
                                <label className="form-check-label" htmlFor="automaticMode">
                                    Automatic
                                </label>
                            </div>
                            <div className="form-check ms-3">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sessionMode"
                                    id="manualMode"
                                    value="manual"
                                    checked={selectedMode === 'manual'}
                                    onChange={handleModeChange}
                                />
                                <label className="form-check-label" htmlFor="manualMode">
                                    Manual
                                </label>
                            </div>
                        </div>
                    ) : (
                        !loading && <p>No settings available.</p>
                    )}
                </div>
            </div>
            <div className="col-md-6 text-center px-5">
                <h5>Current Session Time Left</h5>
                <h1 style={{fontSize: '55px'}} className='text-danger'>{timer}</h1>
                <h4>Select Current session result</h4>
                <div className="card-container p-0 mt-4">
                    {cardData.map((card) => (
                        <div
                          className={`p-0 d-flex flex-column mt-1 align-items-center ${selectedCard === card.id ? 'selected-card' : ''}`}
                          key={card.id}
                          onClick={() => handleCardSelect(card.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Bet Amount Display */}
                          <span className="text-danger fw-bold" style={{ height: '25px' }}>
                            {sessionbetAmount?.find((item) => item.card === card.id)?.amount || ''}
                          </span>
                                            
                          {/* Card Image */}
                          <div
                            className="card p-2 position-relative d-flex justify-content-center align-items-center"
                            style={{ backgroundColor: selectedCard === card.id ? '#edc01c' : '' }}
                          >
                            <div className="d-flex justify-content-center align-items-center w-100 h-100">
                              <img src={card.image} alt={card.id} />
                            </div>
                          </div>
                        </div>
                    ))}
                </div>
                <button
                    className="btn btn-primary mt-4"
                    onClick={handleCardSubmit}
                    disabled={resultLoading}
                >
                    {resultLoading && (
                      <span 
                        className="spinner-border spinner-border-sm me-2" 
                        role="status" 
                        aria-hidden="true"
                      ></span>
                    )}
                    Submit session result
                </button>
            </div>
        </div>
    );
});

export default Summary;
