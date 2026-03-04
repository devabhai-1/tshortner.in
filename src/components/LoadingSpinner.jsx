import React from 'react';
import styles from './LoadingSpinner.module.css';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        {/* Main Spinning Circle */}
        <div className={styles.spinnerWrapper}>
          {/* Outer Ring - Large */}
          <div className={styles.spinnerOuter}></div>
          
          {/* Middle Ring - Medium */}
          <div className={styles.spinnerMiddle}></div>
          
          {/* Inner Ring - Small */}
          <div className={styles.spinnerInner}></div>
          
          {/* Center Logo */}
          <div className={styles.logoCenter}>
            <span>T</span>
          </div>
          
          {/* Orbiting Circles - Outer Ring */}
          <div className={styles.orbitCircle} style={{ '--delay': '0s', '--angle': '0deg', '--radius': '110px' }}></div>
          <div className={styles.orbitCircle} style={{ '--delay': '0.2s', '--angle': '72deg', '--radius': '110px' }}></div>
          <div className={styles.orbitCircle} style={{ '--delay': '0.4s', '--angle': '144deg', '--radius': '110px' }}></div>
          <div className={styles.orbitCircle} style={{ '--delay': '0.6s', '--angle': '216deg', '--radius': '110px' }}></div>
          <div className={styles.orbitCircle} style={{ '--delay': '0.8s', '--angle': '288deg', '--radius': '110px' }}></div>
          
          {/* Orbiting Circles - Inner Ring */}
          <div className={`${styles.orbitCircle} ${styles.orbitSmall}`} style={{ '--delay': '0.1s', '--angle': '45deg', '--radius': '70px' }}></div>
          <div className={`${styles.orbitCircle} ${styles.orbitSmall}`} style={{ '--delay': '0.3s', '--angle': '135deg', '--radius': '70px' }}></div>
          <div className={`${styles.orbitCircle} ${styles.orbitSmall}`} style={{ '--delay': '0.5s', '--angle': '225deg', '--radius': '70px' }}></div>
          <div className={`${styles.orbitCircle} ${styles.orbitSmall}`} style={{ '--delay': '0.7s', '--angle': '315deg', '--radius': '70px' }}></div>
          
          {/* Rotating Dots Around Center */}
          <div className={styles.rotatingDots}>
            <div className={styles.rotatingDot} style={{ '--index': '0' }}></div>
            <div className={styles.rotatingDot} style={{ '--index': '1' }}></div>
            <div className={styles.rotatingDot} style={{ '--index': '2' }}></div>
            <div className={styles.rotatingDot} style={{ '--index': '3' }}></div>
            <div className={styles.rotatingDot} style={{ '--index': '4' }}></div>
            <div className={styles.rotatingDot} style={{ '--index': '5' }}></div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className={styles.loadingText}>
          <span className={styles.loadingMessage}>{message}</span>
          <div className={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      {/* Background Glow Effects */}
      <div className={styles.glowEffect1}></div>
      <div className={styles.glowEffect2}></div>
      <div className={styles.glowEffect3}></div>
      
      {/* Floating Particles */}
      <div className={styles.particle} style={{ '--delay': '0s', '--x': '10%', '--y': '20%' }}></div>
      <div className={styles.particle} style={{ '--delay': '1s', '--x': '80%', '--y': '30%' }}></div>
      <div className={styles.particle} style={{ '--delay': '2s', '--x': '50%', '--y': '70%' }}></div>
      <div className={styles.particle} style={{ '--delay': '3s', '--x': '20%', '--y': '80%' }}></div>
      <div className={styles.particle} style={{ '--delay': '4s', '--x': '90%', '--y': '60%' }}></div>
    </div>
  );
}

export default LoadingSpinner;
