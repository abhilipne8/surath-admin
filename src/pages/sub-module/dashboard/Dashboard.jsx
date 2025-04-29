import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchSessionbetAmount, fetchSessionInfo } from '../../../store/surath/surath';
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

// const socket = io('https://surath.online', {
//   path: "/api/socket.io/",
//   transports: ["websocket", "polling"], // WebSocket as the primary transport
//   withCredentials: true,
// });

const socket = io(import.meta.env.VITE_SOCKET_API_URL);

function Dashboard() {
  const dispatch = useDispatch()
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


  useEffect(() => {
    dispatch(fetchSessionInfo())
    .unwrap()
    .then((data) => {
      const endTime = new Date(data.endTime);
      const remainingMilliseconds = endTime - new Date();
      const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
      startCountdownTimer(remainingSeconds, data.sessionId)
    })

    
    const handleSessionStarted = (sessionData) => {
      const endTime = new Date(sessionData.endTime);
      const remainingMilliseconds = endTime - new Date();
      const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
      startCountdownTimer(remainingSeconds, sessionData.sessionId)
      setSessionId(sessionData.sessionId)
    };
  
    socket.on("sessionStarted", handleSessionStarted);
  
    return () => {
      socket.off("sessionStarted", handleSessionStarted);
    };
  }, []);

  function startCountdownTimer(seconds, sessionId) {
    SetSessionbetAmount([])
    const interval = setInterval(() => {
      seconds--;
  
      if (seconds <= 0) {
        clearInterval(interval); // Stop the timer when it reaches 0
        dispatch(fetchSessionbetAmount(sessionId))
        .unwrap()
        .then((data) => {
          SetSessionbetAmount(data.bets)
        })
      }
    }, 1000); // 1000ms = 1 second
  }
  return (
    <>
         <div className="row">
      <div className="col-sm-12 col-md-6">
        <div className="card-container p-0">
          {cardData.map((card) => {
            // Find the amount for the current card
            const bet = sessionbetAmount?.find((item) => item.card === card.id);

            return (
              <div key={card.id} className="p-0 d-flex flex-column align-items-center">
                {/* Show the amount in a span above the card */}
                <span className='text-danger' style={{height: '25px'}}>{bet ? bet.amount : ''}</span>
                
                {/* Card */}
                <div className="card p-2">
                  <img src={card.image} alt={card.id} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  )
}

export default Dashboard