import { Fragment, useEffect, useState } from "react";

const HEADLINE_WORDS = "Every support request, routed to the right team.".split(" ");

// Resets on refresh or a new visit, because the whole app reloads
let introPlayed = false;

// Shared frame for the sign-in and sign-up pages: brand panel on the left, form on the right.
function AuthLayout({ className = "", children }) {
  // The side panel intro plays once per page load, not when moving between sign-in and sign-up
  const [playIntro] = useState(() => !introPlayed);
  useEffect(() => {
    introPlayed = true;
  }, []);

  return (
    <div className={`auth-split ${playIntro ? "auth-split-intro" : ""} ${className}`}>
      <aside className="auth-aside">
        <div className="auth-aside-brand">
          <span className="brand-icon" aria-hidden="true">LP</span>
          <span>Los Polos Hermanos</span>
        </div>
        <div>
          <h2>
            {HEADLINE_WORDS.map((word, index) => (
              <Fragment key={word}>
                <span className="auth-headline-word" style={{ "--word": index }}>{word}</span>{" "}
              </Fragment>
            ))}
          </h2>
          <ul className="auth-points">
            <li><strong>Automatic triage</strong>Requests are classified and sent to the right department.</li>
            <li><strong>Replies reviewed by people</strong>Suggested replies are approved before they reach customers.</li>
            <li><strong>Status you can follow</strong>Track any request with its ticket ID.</li>
          </ul>
        </div>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  );
}

export default AuthLayout;
