// app/(auth)/login/page.jsx
import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Login — Quran Odyssey',
};

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center max-w-[480px]">
      <div className="mb-8 text-center">
        <h1 className="text-[28px] font-[800] tracking-[-0.03em] text-content-primary">
          Welcome back
        </h1>
        <p className="mt-2 text-[15px] text-content-muted">
          Sign in to access your dashboard and classes.
        </p>
      </div>

      <SignIn appearance={clerkAppearance} />
    </div>
  );
}

const clerkAppearance = {
  variables: {
    colorPrimary:         '#28b7d9',
    colorBackground:      '#ffffff',
    colorText:            '#0f172a',
    colorTextSecondary:   '#64748b',
    colorInputBackground: '#ffffff',
    colorInputText:       '#0f172a',
    colorDanger:          '#ef4444',
    borderRadius:         '0.625rem',
    fontFamily:           'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: {
      bold:    800,
      medium:  600,
      normal:  400,
    },
  },
  elements: {
    card:                   'shadow-none border border-line-light rounded-[var(--radius-lg)] p-8',
    headerTitle:            'hidden',
    headerSubtitle:         'hidden',
    socialButtonsBlockButton: 'border border-line-light bg-white text-content-primary hover:bg-surface-light transition rounded-[var(--radius)]',
    formButtonPrimary:      'bg-brand-amber text-brand-navy font-[800] hover:bg-brand-amber-dark transition rounded-[var(--radius)] h-11',
    formFieldInput:         'border border-line-light bg-white text-content-primary rounded-[var(--radius-sm)] h-11 px-4 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 outline-none',
    formFieldLabel:         'text-[12px] font-[700] text-content-primary',
    footerActionLink:       'text-brand-cyan-dark font-[700] hover:text-brand-cyan',
    identityPreviewText:    'text-content-primary',
    formResendCodeLink:     'text-brand-cyan-dark font-[700]',
  },
};