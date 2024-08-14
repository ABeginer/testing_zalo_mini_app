import React, { useState, useRef } from 'react';
import "../css/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

const LongPressButton = ({ onLongPress, onClick, delay = 500 }) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timerRef = useRef(null);

  const startPressTimer = () => {
    timerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      onLongPress(); // Call the long press function
    }, delay); // Set the delay for long press
  };

  const clearPressTimer = () => {
    clearTimeout(timerRef.current);
    setLongPressTriggered(false); // Reset long press trigger
  };

  const handleMouseDown = () => startPressTimer();
  const handleMouseUp = () => {
    clearPressTimer();
    if (!longPressTriggered) {
      onClick(); // If it wasn't a long press, handle the normal click
    }
  };
  
  const handleMouseLeave = clearPressTimer;
  
  const handleTouchStart = () => startPressTimer();
  const handleTouchEnd = () => {
    clearPressTimer();
    if (!longPressTriggered) {
      onClick(); // If it wasn't a long press, handle the normal click
    }
  };

  const handleTouchCancel = clearPressTimer;

  return (
    <button 
      className='button'
      style={{color: "#54FACF", display: "flex", borderLeft: "2px solid #fff",
        userSelect: "none", /* Standard */
         }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <FontAwesomeIcon style={{padding: "2px",userSelect: "none"}} icon={faCompass} size="1x" />
      Auto detect
    </button>
  );
};

export default LongPressButton;
