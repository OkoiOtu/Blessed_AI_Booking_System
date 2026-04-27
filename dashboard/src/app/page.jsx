import Link from 'next/link';

export const metadata = { title: 'Ariva — AI-Powered Transportation Booking' };

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .lp-root {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          color: #fff;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Grid bg */
        .lp-grid-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* Nav */
        .lp-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px; border-bottom: 1px solid rgba(255,255,255,0.07);
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10,10,15,0.92); backdrop-filter: blur(20px);
        }
        .lp-nav-offset { height: 65px; }
        .lp-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
          text-decoration: none; color: #fff;
        }
        .lp-logo-mark {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          display: flex; align-items: center; justify-content: center; font-size: 17px;
        }
        .lp-navlinks { display: flex; align-items: center; gap: 32px; }
        .lp-navlinks a { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .lp-navlinks a:hover { color: #fff; }
        .lp-nav-cta { display: flex; gap: 10px; }
        .lp-btn { padding: 9px 20px; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .lp-btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); }
        .lp-btn-ghost:hover { border-color: rgba(255,255,255,0.35); color: #fff; }
        .lp-btn-primary { background: #6c63ff; border: none; color: #fff; }
        .lp-btn-primary:hover { background: #7c74ff; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(108,99,255,0.35); }

        /* Hero */
        .lp-hero { padding: 90px 48px 80px; text-align: center; max-width: 960px; margin: 0 auto; position: relative; z-index: 1; }
        .lp-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .lp-orb-1 { width: 500px; height: 500px; top: -80px; left: 50%; transform: translateX(-50%); background: rgba(108,99,255,0.2); }
        .lp-orb-2 { width: 280px; height: 280px; bottom: 0; right: 8%; background: rgba(52,211,153,0.1); }

        .lp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.28);
          border-radius: 100px; padding: 6px 16px; font-size: 13px; color: #a78bfa;
          margin-bottom: 32px;
        }
        .lp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; animation: lp-pulse 2s infinite; }
        @keyframes lp-pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

        .lp-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(40px, 6vw, 72px); line-height: 1.06; letter-spacing: -0.03em; margin-bottom: 22px; }
        .lp-h1 em { font-style: normal; background: linear-gradient(135deg, #6c63ff, #a78bfa 50%, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-hero-sub { font-size: 18px; color: rgba(255,255,255,0.5); max-width: 540px; margin: 0 auto 44px; font-weight: 300; line-height: 1.75; }
        .lp-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .lp-btn-lg { padding: 14px 32px; font-size: 15px; border-radius: 10px; }

        /* Mockup */
        .lp-mockup-wrap { max-width: 860px; margin: 64px auto 0; padding: 0 48px; position: relative; z-index: 1; }
        .lp-mockup-glow { position: absolute; inset: -40px; border-radius: 24px; background: radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.22), transparent 70%); filter: blur(20px); }
        .lp-mockup { background: #1c1c26; border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; overflow: hidden; position: relative; box-shadow: 0 40px 80px rgba(0,0,0,0.6); }
        .lp-mbar { background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 12px 16px; display: flex; align-items: center; gap: 8px; }
        .lp-mdot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-murl { flex: 1; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 4px 12px; font-size: 12px; color: rgba(255,255,255,0.3); margin: 0 12px; }
        .lp-mbody { display: grid; grid-template-columns: 52px 1fr; height: 300px; }
        .lp-msidebar { background: rgba(255,255,255,0.02); border-right: 1px solid rgba(255,255,255,0.07); padding: 12px 7px; display: flex; flex-direction: column; gap: 6px; }
        .lp-mnavitem { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.04); margin: 0 auto; }
        .lp-mnavitem.on { background: rgba(108,99,255,0.3); }
        .lp-mmain { padding: 18px; }
        .lp-mrow { display: flex; gap: 10px; margin-bottom: 10px; }
        .lp-mstat { flex: 1; height: 60px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; }
        .lp-mval { height: 12px; width: 48%; border-radius: 4px; }
        .lp-mlbl { height: 7px; width: 68%; border-radius: 4px; background: rgba(255,255,255,0.07); }
        .lp-mtable { background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; }
        .lp-mth { background: rgba(255,255,255,0.04); padding: 7px 12px; display: flex; gap: 8px; }
        .lp-mthcell { height: 6px; border-radius: 4px; background: rgba(255,255,255,0.12); }
        .lp-mtr { padding: 7px 12px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 8px; align-items: center; }
        .lp-mtd { height: 6px; border-radius: 4px; background: rgba(255,255,255,0.06); }
        .lp-mbadge { height: 14px; width: 50px; border-radius: 20px; }

        /* Stats */
        .lp-stats { border-top: 1px solid rgba(255,255,255,0.07); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 28px 48px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px; max-width: 840px; margin: 80px auto 0; position: relative; z-index: 1; }
        .lp-stat { text-align: center; }
        .lp-statnum { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 700; background: linear-gradient(135deg, #fff, rgba(255,255,255,0.55)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-statlbl { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }

        /* Sections */
        .lp-section { padding: 96px 48px; max-width: 1060px; margin: 0 auto; position: relative; z-index: 1; text-align: left; }
        .lp-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #a78bfa; margin-bottom: 14px; }
        .lp-h2 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(26px, 4vw, 42px); line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 14px; }
        .lp-sub { font-size: 15px; color: rgba(255,255,255,0.45); max-width: 460px; margin-bottom: 56px; font-weight: 300; line-height: 1.7; }

        /* Steps */
        .lp-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
        .lp-step { background: #1c1c26; padding: 32px 24px; transition: background 0.2s; }
        .lp-step:hover { background: rgba(108,99,255,0.08); }
        .lp-stepnum { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #6c63ff; margin-bottom: 18px; }
        .lp-stepicon { font-size: 26px; margin-bottom: 12px; }
        .lp-step h3 { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; margin-bottom: 8px; }
        .lp-step p { font-size: 13px; color: rgba(255,255,255,0.42); line-height: 1.65; }

        /* Features */
        .lp-feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .lp-feat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 26px 22px; transition: border-color 0.2s, transform 0.2s; }
        .lp-feat:hover { border-color: rgba(108,99,255,0.32); transform: translateY(-2px); }
        .lp-featicon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 19px; margin-bottom: 14px; }
        .lp-feat h3 { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; margin-bottom: 7px; }
        .lp-feat p { font-size: 13px; color: rgba(255,255,255,0.42); line-height: 1.65; }

        /* Pricing */
        .lp-pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; align-items: start; }
        .lp-plan { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 30px 26px; position: relative; }
        .lp-plan.hot { background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.45); }
        .lp-planbadge { position: absolute; top: -11px; left: 50%; transform: translateX(-50%); background: #6c63ff; color: #fff; font-size: 11px; font-weight: 600; padding: 3px 14px; border-radius: 100px; white-space: nowrap; }
        .lp-planname { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 10px; }
        .lp-planprice { font-family: 'Syne', sans-serif; font-size: 38px; font-weight: 800; line-height: 1; margin-bottom: 6px; }
        .lp-planprice span { font-size: 15px; font-weight: 400; color: rgba(255,255,255,0.4); }
        .lp-plandesc { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 22px; }
        .lp-planfeats { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 26px; }
        .lp-planfeats li { font-size: 13px; display: flex; gap: 8px; align-items: flex-start; color: rgba(255,255,255,0.75); }
        .lp-planfeats li::before { content: '✓'; color: #34d399; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
        .lp-plancta { width: 100%; padding: 11px; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; text-align: center; text-decoration: none; display: block; transition: all 0.2s; }
        .lp-plancta-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.75); }
        .lp-plancta-ghost:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
        .lp-plancta-solid { background: #6c63ff; border: none; color: #fff; }
        .lp-plancta-solid:hover { background: #7c74ff; }

        /* CTA band */
        .lp-ctaband { margin: 0 48px 96px; background: linear-gradient(135deg, rgba(108,99,255,0.18), rgba(167,139,250,0.08)); border: 1px solid rgba(108,99,255,0.28); border-radius: 20px; padding: 72px 48px; text-align: center; position: relative; overflow: hidden; z-index: 1; }
        .lp-ctaband::before { content:''; position:absolute; top:-60px; left:50%; transform:translateX(-50%); width:400px; height:200px; background:radial-gradient(ellipse, rgba(108,99,255,0.28), transparent 70%); }
        .lp-ctaband h2 { font-family: 'Syne', sans-serif; font-size: clamp(26px, 4vw, 44px); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 14px; }
        .lp-ctaband p { font-size: 16px; color: rgba(255,255,255,0.45); margin-bottom: 36px; }
        .lp-ctabandctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* Footer */
        .lp-footer { border-top: 1px solid rgba(255,255,255,0.07); padding: 36px 48px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; position: relative; z-index: 1; }
        .lp-footerlinks { display: flex; gap: 24px; }
        .lp-footerlinks a { font-size: 13px; color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.2s; }
        .lp-footerlinks a:hover { color: rgba(255,255,255,0.8); }
        .lp-footer p { font-size: 13px; color: rgba(255,255,255,0.3); }

        @media (max-width: 768px) {
          .lp-nav { padding: 14px 20px; }
          .lp-navlinks { display: none; }
          .lp-hero { padding: 80px 20px 56px; }
          .lp-steps { grid-template-columns: 1fr; }
          .lp-feats { grid-template-columns: 1fr; }
          .lp-pricing { grid-template-columns: 1fr; }
          .lp-section { padding: 60px 20px; }
          .lp-stats { padding: 22px 20px; margin-top: 56px; }
          .lp-mockup-wrap { padding: 0 20px; }
          .lp-ctaband { margin: 0 20px 56px; padding: 44px 22px; }
          .lp-footer { padding: 28px 20px; flex-direction: column; align-items: flex-start; }
          .lp-mbody { grid-template-columns: 1fr; }
          .lp-msidebar { display: none; }
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-grid-bg" />
        <div className="lp-nav-offset" />

        {/* Nav */}
        <nav className="lp-nav">
          <Link href="/" className="lp-logo">
            <div className="lp-logo-mark">🚗</div>
            Ariva
          </Link>
          <div className="lp-navlinks">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="lp-nav-cta">
            <Link href="/login" className="lp-btn lp-btn-ghost" target="_blank" rel="noopener noreferrer">Sign in</Link>
            <Link href="/signup" className="lp-btn lp-btn-primary" target="_blank" rel="noopener noreferrer">Get started →</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ position:'relative', overflow:'hidden' }}>
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-hero">
            <div className="lp-badge">
              <span className="lp-badge-dot" />
              AI-powered booking — live on every call
            </div>
            <h1 className="lp-h1">
              Your AI receptionist<br/>
              <em>never misses a booking</em>
            </h1>
            <p className="lp-hero-sub">
              Ariva answers every inbound call, collects booking details, confirms pricing, and updates your dashboard — fully automated, 24/7.
            </p>
            <div className="lp-ctas">
              <Link href="/signup" className="lp-btn lp-btn-primary lp-btn-lg" target="_blank" rel="noopener noreferrer">Start free trial →</Link>
              <a href="#how" className="lp-btn lp-btn-ghost lp-btn-lg">See how it works</a>
            </div>
          </div>

          {/* Mockup */}
          <div className="lp-mockup-wrap">
            <div className="lp-mockup-glow" />
            <div className="lp-mockup">
              <div className="lp-mbar">
                <div className="lp-mdot" style={{background:'#ff5f57'}} />
                <div className="lp-mdot" style={{background:'#febc2e'}} />
                <div className="lp-mdot" style={{background:'#28c840'}} />
                <div className="lp-murl">app.ariva.ai/dashboard</div>
              </div>
              <div className="lp-mbody">
                <div className="lp-msidebar">
                  {[true,false,false,false,false,false].map((on,i) => (
                    <div key={i} className={'lp-mnavitem'+(on?' on':'')} />
                  ))}
                </div>
                <div className="lp-mmain">
                  <div className="lp-mrow">
                    {[['rgba(108,99,255,0.5)'],['rgba(52,211,153,0.4)'],['rgba(251,191,36,0.4)'],['rgba(248,113,113,0.4)']].map(([c],i) => (
                      <div key={i} className="lp-mstat">
                        <div className="lp-mval" style={{background:c}} />
                        <div className="lp-mlbl" />
                      </div>
                    ))}
                  </div>
                  <div className="lp-mtable">
                    <div className="lp-mth">
                      {[80,60,100,55].map((w,i) => <div key={i} className="lp-mthcell" style={{width:w}} />)}
                    </div>
                    {[['rgba(52,211,153,0.2)'],['rgba(108,99,255,0.2)'],['rgba(251,191,36,0.2)'],['rgba(52,211,153,0.2)']].map(([bg],i) => (
                      <div key={i} className="lp-mtr">
                        <div className="lp-mtd" style={{width:85+i*5}} />
                        <div className="lp-mtd" style={{width:65}} />
                        <div className="lp-mtd" style={{width:100}} />
                        <div className="lp-mbadge" style={{background:bg}} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="lp-stats">
          {[['24/7','Call coverage, zero downtime'],['<3s','Booking confirmation time'],['100%','Calls answered automatically'],['SMS','Instant customer confirmation']].map(([n,l]) => (
            <div key={n} className="lp-stat">
              <div className="lp-statnum">{n}</div>
              <div className="lp-statlbl">{l}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <section className="lp-section" id="how">
          <div className="lp-tag">How it works</div>
          <h2 className="lp-h2">From call to confirmed booking<br/>in under 60 seconds</h2>
          <p className="lp-sub">No staff required. No missed calls. No manual data entry.</p>
          <div className="lp-steps">
            {[
              ['01','📞','Customer calls in','Your AI agent Aria answers immediately, greets the caller warmly, and begins collecting booking details.'],
              ['02','🧠','AI captures everything','Name, pickup time, address, vehicle type, duration — all extracted automatically from the conversation.'],
              ['03','💰','Price calculated','Your pricing rules are applied instantly. Fixed routes or hourly rates — confirmed on the call.'],
              ['04','📊','Dashboard updates live','Booking appears on your dashboard the moment the call ends. Assign a driver, track status, manage everything.'],
              ['05','💬','Customer gets SMS','Confirmation sent automatically with booking reference, pickup details, price, and a cancellation link.'],
            ].map(([n,icon,title,desc]) => (
              <div key={n} className="lp-step">
                <div className="lp-stepnum">STEP {n}</div>
                <div className="lp-stepicon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="lp-section" id="features">
          <div className="lp-tag">Features</div>
          <h2 className="lp-h2">Everything a transport<br/>business needs</h2>
          <p className="lp-sub">Built for real operations. Not just a demo.</p>
          <div className="lp-feats">
            {[
              ['rgba(108,99,255,0.15)','🤖','AI voice agent','Natural conversation in English. Handles accents, incomplete sentences, and clarifications gracefully.'],
              ['rgba(52,211,153,0.15)','📅','Booking calendar','Monthly view with all bookings colour-coded by status. See your entire schedule at a glance.'],
              ['rgba(251,191,36,0.15)','💲','Flexible pricing engine','Hourly rates per vehicle type plus fixed routes. Price is quoted on the call and included in the SMS.'],
              ['rgba(248,113,113,0.15)','🚗','Driver management','Assign drivers with conflict detection. Track who is available, on trip, or off duty in real time.'],
              ['rgba(167,139,250,0.15)','📈','Revenue tracking','Daily, weekly, and monthly revenue charts. Filter by date range and export to CSV in one click.'],
              ['rgba(96,165,250,0.15)','👥','Customer history','Look up any customer by phone number. Full booking history, total spend, trip count.'],
              ['rgba(52,211,153,0.15)','🔔','SMS reminders','Automated 1-hour pickup reminders. Admin alert SMS for every new booking and lead.'],
              ['rgba(108,99,255,0.15)','🏢','Multi-company ready','Each company gets its own data, phone number, and AI assistant. Ready for SaaS scale.'],
            ].map(([bg,icon,title,desc]) => (
              <div key={title} className="lp-feat">
                <div className="lp-featicon" style={{background:bg}}>{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="lp-section" id="pricing">
          <div className="lp-tag">Pricing</div>
          <h2 className="lp-h2">Simple, transparent pricing</h2>
          <p className="lp-sub">Start free. Scale when you are ready. No hidden fees.</p>
          <div className="lp-pricing">
            <div className="lp-plan">
              <div className="lp-planname">Starter</div>
              <div className="lp-planprice">Free<span> / month</span></div>
              <div className="lp-plandesc">Perfect for testing or small operations.</div>
              <ul className="lp-planfeats">
                {['Up to 50 bookings/month','AI voice agent','Dashboard access','SMS confirmation','1 admin user'].map(f => <li key={f}>{f}</li>)}
              </ul>
              <Link href="/signup" className="lp-plancta lp-plancta-ghost" target="_blank" rel="noopener noreferrer">Get started free</Link>
            </div>

            <div className="lp-plan hot">
              <div className="lp-planbadge">Most popular</div>
              <div className="lp-planname">Professional</div>
              <div className="lp-planprice">$49<span> / month</span></div>
              <div className="lp-plandesc">For growing transport businesses.</div>
              <ul className="lp-planfeats">
                {['Unlimited bookings','AI voice agent + pricing engine','Driver management','Revenue tracking + CSV exports','SMS reminders + admin alerts','Up to 10 users','Priority support'].map(f => <li key={f}>{f}</li>)}
              </ul>
              <Link href="/signup?plan=professional" className="lp-plancta lp-plancta-solid" target="_blank" rel="noopener noreferrer">Start free trial</Link>
            </div>

            <div className="lp-plan">
              <div className="lp-planname">Enterprise</div>
              <div className="lp-planprice">Custom</div>
              <div className="lp-plandesc">For fleets and multi-location operations.</div>
              <ul className="lp-planfeats">
                {['Everything in Professional','Multi-company SaaS setup','Custom AI voice and branding','Dedicated Twilio number','White-label dashboard','Unlimited users','SLA + dedicated support'].map(f => <li key={f}>{f}</li>)}
              </ul>
              <a href="mailto:hello@ariva.ai" className="lp-plancta lp-plancta-ghost">Contact us</a>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <div className="lp-ctaband">
          <h2>Ready to automate your bookings?</h2>
          <p>Set up in under 30 minutes. No coding required.</p>
          <div className="lp-ctabandctas">
            <Link href="/signup" className="lp-btn lp-btn-primary lp-btn-lg" target="_blank" rel="noopener noreferrer">Start free today →</Link>
            <Link href="/login" className="lp-btn lp-btn-ghost lp-btn-lg">Sign in to dashboard</Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="lp-footer">
          <Link href="/" className="lp-logo" style={{fontSize:18}}>
            <div className="lp-logo-mark" style={{width:28,height:28,fontSize:14}}>🚗</div>
            Ariva
          </Link>
          <div className="lp-footerlinks">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link href="/login">Dashboard</Link>
            <a href="mailto:hello@ariva.ai">Contact</a>
          </div>
          <p>© 2026 Ariva. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
