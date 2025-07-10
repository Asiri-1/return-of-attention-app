// src/types/google.d.ts
// Google Identity Services Type Declarations

declare global {
    interface Window {
      google?: {
        accounts: {
          id: {
            initialize: (config: GoogleInitConfig) => void;
            prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
            renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
            revoke: (accessToken: string, callback: (response: any) => void) => void;
            cancel: () => void;
          };
        };
      };
    }
  }
  
  interface GoogleInitConfig {
    client_id: string;
    callback: (response: GoogleCallbackResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    state_cookie_domain?: string;
    ux_mode?: 'popup' | 'redirect';
    login_uri?: string;
    native_callback?: (response: any) => void;
    intermediate_iframe_close_callback?: () => void;
    itp_support?: boolean;
  }
  
  interface GoogleCallbackResponse {
    credential: string;
    select_by: 'auto' | 'user' | 'user_1tap' | 'user_2tap' | 'btn' | 'btn_confirm' | 'brn_add_session' | 'btn_confirm_add_session';
    clientId?: string;
  }
  
  interface GooglePromptNotification {
    isDisplayMoment: () => boolean;
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    getNotDisplayedReason: () => 'browser_not_supported' | 'invalid_client' | 'missing_client_id' | 'opt_out_or_no_session' | 'secure_http_required' | 'suppressed_by_user' | 'unregistered_origin' | 'unknown_reason';
    isSkippedMoment: () => boolean;
    getSkippedReason: () => 'auto_cancel' | 'user_cancel' | 'tap_outside' | 'issuing_failed';
    isDismissedMoment: () => boolean;
    getDismissedReason: () => 'credential_returned' | 'cancel_called' | 'flow_restarted';
    getMomentType: () => 'display' | 'skipped' | 'dismissed';
  }
  
  interface GoogleButtonConfig {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string | number;
    locale?: string;
  }
  
  export {};