import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ background: '#fff', display: 'inline-block', borderRadius: '50%', padding: '4px', marginBottom: '16px' }}>
            <img 
              src="/images/logo.png" 
              alt="SD Sign Studio" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} 
            />
          </div>
          <p>Your one-stop solution for vehicle wraps, signage, printing and branding. We turn ideas into powerful visual identities.</p>
          <div className="footer-socials">
            <div className="soc-btn">f</div>
            <div className="soc-btn">in</div>
            <div className="soc-btn">▶</div>
            <div className="soc-btn">📷</div>
          </div>
        </div>

        <div className="footer-col">
          <h5>Quick Links</h5>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/#services">Services</Link></li>
            <li><Link to="/shop">Products</Link></li>
            <li><Link to="/#portfolio">Portfolio</Link></li>
            <li><Link to="/#about">About Us</Link></li>
            <li><Link to="/#contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Our Services</h5>
          <ul>
            <li><a href="#">Vehicle Wraps</a></li>
            <li><a href="#">Commercial Signage</a></li>
            <li><a href="#">Window Graphics</a></li>
            <li><a href="#">Business Printing</a></li>
            <li><a href="#">Fleet Branding</a></li>
            <li><a href="#">Design Services</a></li>
          </ul>
        </div>

        <div className="footer-col" id="contact-footer">
          <h5>Contact Us</h5>
          <div className="contact-item">
            <span className="icon">📞</span>
            <span>07715 669 077</span>
          </div>
          <div className="contact-item">
            <span className="icon">✉️</span>
            <span>info@sdsignstudio.com</span>
          </div>
          <div className="contact-item">
            <span className="icon">📍</span>
            <span>123 Studio Road, Glasgow, G12 8QQ</span>
          </div>
          <div className="contact-item">
            <span className="icon">🕐</span>
            <span>Mon - Sat: 9:00 AM – 6:00 PM</span>
          </div>
          <div className="map-wrap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d143634.34005886476!2d-4.390500186106602!3d55.85536551152062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x488815562056ceeb%3A0x71e683b805ef511e!2sGlasgow!5e0!3m2!1sen!2suk!4v1717277684000!5m2!1sen!2suk"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 SD Sign Studio. All Rights Reserved.
      </div>
    </footer>
  )
}
