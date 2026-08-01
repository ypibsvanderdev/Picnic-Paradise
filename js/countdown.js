/**
 * Picnic Paradise Countdown Logic
 * Runs only on the homepage.
 */

(function() {
  // Target date: August 28, 2026, 10:00:00
  const targetDate = new Date('2026-08-28T10:00:00').getTime();
  
  let countdownInterval;

  function initCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');
    const msgEl = document.getElementById('countdownMessage');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function updateTimer() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(countdownInterval);
        
        // Hide the boxes
        const container = document.querySelector('.countdown-container');
        if (container) {
          container.style.display = 'none';
        }
        
        // Show message
        if (msgEl) {
          msgEl.textContent = 'The picnic is happening NOW! 🎉';
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      updateValue(daysEl, formatNum(days));
      updateValue(hoursEl, formatNum(hours));
      updateValue(minsEl, formatNum(minutes));
      updateValue(secsEl, formatNum(seconds));
    }

    // Run immediately then every second
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
  }

  function formatNum(num) {
    return num < 10 ? '0' + num : num;
  }

  function updateValue(element, newValue) {
    if (element.textContent !== newValue.toString()) {
      element.classList.add('flip');
      setTimeout(() => {
        element.textContent = newValue;
        element.classList.remove('flip');
      }, 150); // half of the CSS transition time or suitable for visual effect
    }
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdown);
  } else {
    initCountdown();
  }

  // Cleanup interval on page unload to prevent memory leaks
  window.addEventListener('beforeunload', () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });
})();
