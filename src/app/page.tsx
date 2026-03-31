import Link from 'next/link';
import styles from './page.module.css';
import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className={styles.hero}>
      <header className={styles.header}>
        <div className={styles.logo}>FlowSync</div>
        <nav>
          {session ? (
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}>
              <button type="submit" className="btn btn-secondary">
                Sign In
              </button>
            </form>
          )}
        </nav>
      </header>

      <div className={styles.heroContent}>
        <h1 className={`${styles.title} animate-float`}>
          Automate <span className="text-gradient">Facebook Ads</span> to Google Sheets
        </h1>
        <p className={styles.subtitle}>
          Stop manual CSV exports. Connect your Facebook Ad accounts, map your columns once, 
          and let our n8n-style automation engine append your daily metrics to Google Sheets automatically.
        </p>
        
        <div className={styles.actions}>
          {session ? (
            <Link href="/dashboard" className="btn btn-primary">
              View Your Automations
            </Link>
          ) : (
            <>
              <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}>
                <button type="submit" className="btn btn-primary">
                  Connect with Google
                </button>
              </form>
              <a href="#features" className="btn btn-secondary">
                Learn More
              </a>
            </>
          )}
        </div>

        <div id="features" className={styles.featureGrid}>
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featureIcon}>🔄</div>
            <h3 className={styles.featureTitle}>Automated Sync</h3>
            <p className={styles.featureDesc}>
              Set up daily or weekly schedules to automatically pull your fresh ad data and append it straight to your sheets.
            </p>
          </div>
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>Multi-Account Support</h3>
            <p className={styles.featureDesc}>
              Select one or dozens of Facebook Ad accounts at once. We aggregate and map everything effortlessly.
            </p>
          </div>
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featureIcon}>🗺️</div>
            <h3 className={styles.featureTitle}>Visual Column Mapping</h3>
            <p className={styles.featureDesc}>
              A simple, intuitive interface to decide which Facebook metric goes into which Google Sheet column.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
