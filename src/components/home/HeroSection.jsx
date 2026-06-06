export default function HeroSection() {
  return (
    <section className="hero" id="hero">
      <div className="hero-slide">
        <picture>
          <source media="(max-width: 640px)" srcSet="/images/banner_1.png" />
          <img className="hero-slide-bg" src="/images/banner_4.png" alt="Hero Banner" />
        </picture>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">Signage &amp; Displays.</div>
          <h1 className="hero-headline">
            Stand Out<br />
            <span className="red">Everywhere.</span>
          </h1>
          <p className="hero-sub">Custom signs, banners, window graphics and more — built to make your brand unmissable.</p>
          <div className="hero-btns">
            <a href="#contact" className="btn-red">Get a Free Quote</a>
            <a href="#portfolio" className="btn-outline">View Our Work</a>
          </div>
        </div>
      </div>
    </section>
  )
}
