import React from 'react';
import kpLogo from '../assets/kp_logo.png';

/**
 * AboutSection – showcases brand heritage, story, and craftsmanship.
 * Matches demo's .about, .pair (.i-crm, .i-kal), .ab, .three CSS classes.
 */
export default function AboutSection({ settings = {} }) {
  return (
    <section className="sec" id="about">
      <div className="w about">
        {/* Visual pair */}
        <div className="pair">
          <div className="sw i-crm" />
          <div className="sw i-kal" style={{ marginTop: 28 }} />
        </div>

        {/* Text column */}
        <div>
          <div className="ab">
            <span
              className="lg"
              style={{ backgroundImage: `url(${kpLogo})`, width: 72, height: 72 }}
            />
            <h2>{settings.aboutHeading || 'About KP Clothing'}</h2>
          </div>

          <p>
            {settings.aboutText ||
              'Handpicked sarees with a focus on comfort, craftsmanship and timeless elegance. We work directly with master handloom weavers to bring you authentic cotton sarees that drape effortlessly from morning to night.'}
          </p>

          <div className="three">
            <div>
              <h3>Soft on the skin</h3>
              <p>Comfortable from morning to night</p>
            </div>
            <div>
              <h3>Zari that shines</h3>
              <p>Borders with a real gold finish</p>
            </div>
            <div>
              <h3>Easy to drape</h3>
              <p>Easy to wash and care for</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
