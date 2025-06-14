import { v4 as uuidv4 } from 'uuid';

interface AnalyticsEvent {
  event_name: string;
  [key: string]: any; // Allows for flexible additional properties
}

// Function to get or generate a session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId as string; // Explicitly cast to string after ensuring it's not null
};

// Function to get device information
const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    platform: navigator.platform,
  };
};

export const trackEvent = async (event: AnalyticsEvent, userId?: string) => {
  try {
    // Update this URL to your deployed function URL
    const analyticsFunctionUrl = "https://loganalyticsevent-ikcorhnhlq-uc.a.run.app"; 

    const eventPayload = {
      ...event,
      timestamp: new Date( ).toISOString(),
      user_id: userId || 'anonymous', // Use provided userId or 'anonymous'
      session_id: getSessionId(),
      device_info: getDeviceInfo(),
    };

    const response = await fetch(analyticsFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      console.error("Failed to send analytics event:", response.statusText, await response.text());
    } else {
      console.log("Analytics event sent successfully:", event.event_name);
    }
  } catch (error) {
    console.error("Error sending analytics event:", error);
  }
};
