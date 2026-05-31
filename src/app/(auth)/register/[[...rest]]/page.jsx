// app/(auth)/register/page.jsx
import { SignUp } from '@clerk/nextjs';

export const metadata = {
  title: 'Create Account — Quran Odyssey',
};

export default function RegisterPage() {
  return (
    <div className="w-full flex flex-col justify-center items-center max-w-[480px]">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-brand-cyan-dark mb-4">
          Free trial · No credit card required
        </div>
        <h1 className="text-[28px] font-[800] tracking-[-0.03em] text-content-primary">
          Create your account
        </h1>
        {/* <p className="mt-2 text-[15px] text-content-muted">
          Start your child&apos;s Quran journey today.
        </p> */}
      </div>

      <SignUp appearance={clerkAppearance} />
    </div>
  );
}

// Same appearance object — put this in a shared file if you prefer
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
    card:                 'shadow-none border border-line-light rounded-[var(--radius-lg)] p-8',
    headerTitle:          'hidden',
    headerSubtitle:       'hidden',
    formButtonPrimary:    'bg-brand-amber text-brand-navy font-[800] hover:bg-brand-amber-dark transition rounded-[var(--radius)] h-11',
    formFieldInput:       'border border-line-light bg-white text-content-primary rounded-[var(--radius-sm)] h-11 px-4 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10 outline-none',
    formFieldLabel:       'text-[12px] font-[700] text-content-primary',
    footerActionLink:     'text-brand-cyan-dark font-[700] hover:text-brand-cyan',
    formResendCodeLink:   'text-brand-cyan-dark font-[700]',
  },
};