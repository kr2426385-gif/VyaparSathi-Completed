import React, { useEffect, useRef } from 'react';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StepperContext, useStepper } from './StepperContext.jsx';

export { useStepper };

/**
 * VyaparSathi Horizontal Stepper
 *
 * Default orientation is horizontal.
 *
 * Features:
 * - Responsive horizontal layout
 * - Completed / active / upcoming states
 * - Progress connectors
 * - Clickable completed steps
 * - Active step content below the stepper
 * - Smooth active-step scrolling on small screens
 * - Accessibility support
 */
export function Stepper({
  activeStep = 0,
  onStepChange,
  orientation = 'horizontal',
  allowStepClick = true,
  className = '',
  children
}) {
  const steps = React.Children.toArray(children).filter(Boolean);

  return (
    <StepperContext.Provider
      value={{
        activeStep,
        onStepChange,
        orientation,
        allowStepClick
      }}
    >
      <div
        role="tablist"
        aria-orientation={orientation}
        className={`w-full ${className}`}
      >
        {orientation === 'horizontal' ? (
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="min-w-[680px] sm:min-w-0 flex items-start px-2 sm:px-4">
              {steps.map((child, index) => {
                const isLast = index === steps.length - 1;

                return (
                  <React.Fragment key={child.key ?? index}>
                    <div className="flex-1 min-w-0">
                      {child}
                    </div>

                    {!isLast && (
                      <div className="flex-[0.7] pt-[14px] sm:pt-[16px] px-1 sm:px-2">
                        <div className="relative h-[3px] w-full bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-500 ease-out ${index < activeStep
                              ? 'w-full'
                              : 'w-0'
                              }`}
                          />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {steps}
          </div>
        )}
      </div>
    </StepperContext.Provider>
  );
}

/**
 * Individual Step
 */
export function Step({
  index,
  stepNumber,
  title,
  description,
  badge,
  icon: IconComponent,
  isCompleted,
  completed,
  isActive,
  active,
  isDisabled,
  disabled,
  isLoading = false,
  summary,
  children,
  className = ''
}) {
  const {
    activeStep,
    onStepChange,
    orientation,
    allowStepClick
  } = useStepper();
  const { t } = useTranslation();

  const stepRef = useRef(null);

  const actualIndex =
    typeof index === 'number'
      ? index
      : typeof stepNumber === 'number'
        ? stepNumber - 1
        : 0;

  const displayStepNumber =
    typeof stepNumber === 'number'
      ? stepNumber
      : actualIndex + 1;

  const matchesActive =
    (typeof stepNumber === 'number' &&
      activeStep === stepNumber) ||
    activeStep === actualIndex;

  const isStepCompleted =
    typeof completed === 'boolean'
      ? completed
      : typeof isCompleted === 'boolean'
        ? isCompleted
        : actualIndex < activeStep;

  const isStepActive =
    typeof active === 'boolean'
      ? active
      : typeof isActive === 'boolean'
        ? isActive
        : matchesActive;

  const isStepDisabled =
    typeof disabled === 'boolean'
      ? disabled
      : typeof isDisabled === 'boolean'
        ? isDisabled
        : actualIndex > activeStep;

  /**
   * Keep active step visible on smaller screens.
   */
  useEffect(() => {
    if (
      orientation === 'horizontal' &&
      isStepActive &&
      stepRef.current
    ) {
      const prefersReducedMotion =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;

      if (!prefersReducedMotion) {
        stepRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [isStepActive, orientation]);

  const handleHeaderClick = () => {
    if (
      isStepDisabled ||
      !allowStepClick ||
      !onStepChange
    ) {
      return;
    }

    onStepChange(
      typeof stepNumber === 'number'
        ? stepNumber
        : actualIndex
    );
  };

  const handleKeyDown = (e) => {
    if (
      (e.key === 'Enter' || e.key === ' ') &&
      !isStepDisabled &&
      allowStepClick
    ) {
      e.preventDefault();
      handleHeaderClick();
    }
  };

  /**
   * -----------------------------
   * HORIZONTAL MODE
   * -----------------------------
   */
  if (orientation === 'horizontal') {
    return (
      <div
        ref={stepRef}
        data-step-index={actualIndex}
        data-step-number={displayStepNumber}
        data-step-state={
          isStepCompleted
            ? 'completed'
            : isStepActive
              ? 'active'
              : 'inactive'
        }
        className={`relative flex flex-col items-center text-center min-w-[105px] sm:min-w-0 ${className}`}
      >
        {/* Step Button */}
        <button
          type="button"
          onClick={handleHeaderClick}
          onKeyDown={handleKeyDown}
          disabled={
            isStepDisabled ||
            !allowStepClick
          }
          role="tab"
          aria-selected={isStepActive}
          aria-current={
            isStepActive ? 'step' : undefined
          }
          aria-label={t('stepper.step_label', { step: displayStepNumber, title, defaultValue: `Step ${displayStepNumber}: ${title}` })}
          className={`
            relative z-10
            w-7 h-7
            sm:w-8 sm:h-8
            rounded-full
            flex items-center justify-center
            font-bold
            text-[10px]
            sm:text-xs
            transition-all
            duration-300
            select-none
            shrink-0
            ${isStepCompleted
              ? `
                  bg-emerald-600
                  text-white
                  shadow-sm
                  cursor-pointer
                  hover:bg-emerald-700
                  hover:scale-105
                  active:scale-95
                `
              : isStepActive
                ? `
                    bg-white
                    border-2
                    border-emerald-600
                    text-emerald-800
                    ring-4
                    ring-emerald-100
                    shadow-sm
                    scale-110
                    cursor-default
                  `
                : `
                    bg-white
                    border-2
                    border-stone-300
                    text-stone-400
                    ${isStepDisabled
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:border-stone-400'
                }
                  `
            }
          `}
        >
          {isLoading ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : isStepCompleted ? (
            <Check
              size={14}
              className="stroke-[3]"
            />
          ) : IconComponent ? (
            <IconComponent size={14} />
          ) : (
            displayStepNumber
          )}
        </button>

        {/* Step Text */}
        <div className="mt-2 w-full px-1">
          <h3
            className={`
              text-[11px]
              sm:text-xs
              leading-tight
              font-bold
              transition-colors
              ${isStepActive
                ? 'text-stone-900 font-extrabold'
                : isStepCompleted
                  ? 'text-emerald-900'
                  : 'text-stone-400'
              }
            `}
          >
            {title}
          </h3>

          {description && (
            <p
              className={`
                hidden
                lg:block
                mt-1
                text-[10px]
                leading-tight
                ${isStepActive
                  ? 'text-stone-500'
                  : 'text-stone-400'
                }
              `}
            >
              {description}
            </p>
          )}

          {badge && (
            <span
              className={`
                inline-flex
                mt-1
                px-1.5
                py-0.5
                rounded-full
                border
                text-[8px]
                font-black
                uppercase
                tracking-wide
                ${isStepActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isStepCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-stone-50 text-stone-400 border-stone-200'
                }
              `}
            >
              {badge}
            </span>
          )}

          {isStepCompleted && (
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                <Check
                  size={9}
                  className="stroke-[3]"
                />
                {t('stepper.completed', { defaultValue: 'Completed' })}
              </span>
            </div>
          )}
        </div>

        {/* Completed step action */}
        {isStepCompleted &&
          allowStepClick && (
            <button
              type="button"
              onClick={handleHeaderClick}
              className="
                mt-1
                text-[9px]
                font-bold
                text-emerald-700
                hover:text-emerald-900
                underline
                cursor-pointer
              "
            >
              {t('stepper.change_details', { defaultValue: 'Change details' })}
            </button>
          )}

        {/* Active content */}
        {isStepActive && children && (
          <div
            className="
              w-full
              mt-4
              text-left
              animate-stepper-slide-in
            "
          >
            <div className="
              bg-white
              rounded-2xl
              border
              border-stone-200
              shadow-sm
              p-4
              sm:p-5
            ">
              {children}
            </div>
          </div>
        )}

        {/* Completed summary */}
        {isStepCompleted &&
          !isStepActive &&
          summary && (
            <div
              onClick={
                allowStepClick
                  ? handleHeaderClick
                  : undefined
              }
              className="
                hidden
                md:block
                mt-2
                p-2
                rounded-lg
                bg-emerald-50/40
                border
                border-emerald-100
                text-[9px]
                text-stone-600
                cursor-pointer
              "
            >
              {typeof summary === 'string' ? (
                <span className="font-semibold text-emerald-900">
                  {summary}
                </span>
              ) : (
                summary
              )}
            </div>
          )}
      </div>
    );
  }

  /**
   * -----------------------------
   * VERTICAL FALLBACK
   * -----------------------------
   *
   * Kept so existing pages do not break
   * if orientation="vertical" is explicitly used.
   */
  return (
    <div
      ref={stepRef}
      className={`relative ${className}`}
      data-step-index={actualIndex}
      data-step-number={displayStepNumber}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center shrink-0">
          <button
            type="button"
            onClick={handleHeaderClick}
            onKeyDown={handleKeyDown}
            disabled={
              isStepDisabled ||
              !allowStepClick
            }
            className={`
              w-7 h-7
              rounded-full
              flex items-center justify-center
              font-bold text-xs
              ${isStepCompleted
                ? 'bg-emerald-600 text-white'
                : isStepActive
                  ? 'bg-white border-2 border-emerald-600 text-emerald-800 ring-4 ring-emerald-100'
                  : 'bg-stone-100 border border-stone-300 text-stone-400'
              }
            `}
          >
            {isLoading ? (
              <Loader2
                size={13}
                className="animate-spin"
              />
            ) : isStepCompleted ? (
              <Check size={13} />
            ) : (
              displayStepNumber
            )}
          </button>

          <div className="w-[2px] min-h-[30px] bg-stone-200 mt-1" />
        </div>

        <div className="flex-1 pb-5">
          <h3 className="text-sm font-bold text-stone-900">
            {title}
          </h3>

          {description && (
            <p className="text-xs text-stone-500 mt-1">
              {description}
            </p>
          )}

          {isStepActive && children && (
            <div className="mt-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Step navigation buttons
 */
export function StepActions({
  onNext,
  onBack,
  nextLabel,
  primaryText,
  backLabel,
  finishLabel,
  isNextDisabled = false,
  isLastStep = false,
  isLoading = false,
  className = ''
}) {
  const { t } = useTranslation();

  const defaultBackLabel = backLabel || t('stepper.back', { defaultValue: 'Back' });
  const defaultFinishLabel = finishLabel || t('stepper.finish', { defaultValue: 'Complete & View Summary' });
  const defaultContinueLabel = t('common.save_and_continue', { defaultValue: 'Save & Continue' });

  const rawNextLabel =
    primaryText ||
    nextLabel ||
    (isLastStep
      ? defaultFinishLabel
      : defaultContinueLabel);
  // Strip any trailing arrows so double arrows (→ →) are never rendered
  const effectiveNextLabel = typeof rawNextLabel === 'string' ? rawNextLabel.replace(/\s*(?:→|->)\s*$/g, '').trim() : rawNextLabel;

  return (
    <div
      className={`
        flex
        flex-col-reverse
        sm:flex-row
        items-center
        justify-between
        gap-3
        pt-4
        border-t
        border-stone-100
        ${className}
      `}
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="
            w-full
            sm:w-auto
            px-4
            py-2.5
            rounded-full
            border
            border-stone-300
            hover:bg-stone-50
            text-stone-700
            font-bold
            text-xs
            transition-colors
            flex
            items-center
            justify-center
            gap-1.5
          "
        >
          <ArrowLeft size={14} />
          <span>{defaultBackLabel}</span>
        </button>
      ) : (
        <div />
      )}

      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={
            isNextDisabled ||
            isLoading
          }
          className="
            w-full
            sm:w-auto
            px-6
            py-2.5
            rounded-full
            bg-emerald-600
            hover:bg-emerald-700
            active:bg-emerald-800
            active:scale-95
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-white
            font-bold
            text-xs
            sm:text-sm
            flex
            items-center
            justify-center
            gap-2
            shadow-md
            hover:shadow-lg
            transition-all
          "
        >
          {isLoading ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />
              <span>{t('stepper.saving', { defaultValue: 'Saving...' })}</span>
            </>
          ) : (
            <>
              <span>{effectiveNextLabel}</span>

              {isLastStep ? (
                <Check
                  size={16}
                  className="stroke-[3]"
                />
              ) : (
                <ArrowRight
                  size={15}
                  className="stroke-[2.5]"
                />
              )}
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default Stepper;

