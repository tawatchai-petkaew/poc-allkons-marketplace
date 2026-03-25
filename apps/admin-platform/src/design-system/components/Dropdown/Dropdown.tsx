'use client';

import { type ReactNode, useRef, useState, useId, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Input Dropdown — node 40001604:8780
// Figma: Input Dropdown Menu Item — node 40001604:8388
//
// Trigger types  = Default | Search | Icon leading | Avatar leading | Multi Select
// Item types     = Default | Icon leading | Dot leading | Avatar leading
// States         = Default | Hover | Opened | Disabled

export type DropdownType =
  | 'default'
  | 'search'
  | 'icon-leading'
  | 'avatar-leading'
  | 'multi-select';

export type DropdownItemType = 'default' | 'icon-leading' | 'dot-leading' | 'avatar-leading';

export interface DropdownAvatar {
  src?: string;
  name: string;
}

export interface DropdownOption {
  value: string;
  label: string;
  /** Secondary text rendered after label (e.g. @Item) */
  supportingText?: string;
  /** Per-item type override */
  itemType?: DropdownItemType;
  /** Icon for icon-leading item type */
  icon?: ReactNode;
  /** Avatar for avatar-leading item type */
  avatar?: DropdownAvatar;
  /** Dot color for dot-leading item type (CSS color string) */
  dotColor?: string;
  /** Disables this option */
  disabled?: boolean;
}

export interface DropdownProps {
  /**
   * Visual type — controls the leading element inside the trigger.
   * default        = no leading element
   * search         = magnifier icon
   * icon-leading   = custom icon or default person icon
   * avatar-leading = avatar circle
   * multi-select   = magnifier icon, supports multiple selected values
   */
  type?: DropdownType;
  /** Field label shown above the trigger */
  label?: string;
  /** Shows red asterisk after label */
  required?: boolean;
  /** Shows ? help icon after label */
  showHelpIcon?: boolean;
  /** Helper text shown below the trigger */
  hintText?: string;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Disables the trigger */
  disabled?: boolean;
  /** Controlled selected value (single-select types) */
  value?: string;
  /** Uncontrolled default value (single-select types) */
  defaultValue?: string;
  /** Called when selection changes (single-select types) */
  onChange?: (value: string) => void;
  /** Controlled selected values (multi-select type) */
  values?: string[];
  /** Uncontrolled default values (multi-select type) */
  defaultValues?: string[];
  /** Called when selection changes (multi-select type) */
  onChangeMulti?: (values: string[]) => void;
  /** Options list */
  options?: DropdownOption[];
  /** Leading icon for icon-leading trigger type */
  icon?: ReactNode;
  /** Avatar data for avatar-leading trigger type */
  avatar?: DropdownAvatar;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state should change */
  onOpenChange?: (open: boolean) => void;
  /** Extra classes on the root element */
  className?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5 shrink-0 text-text-tertiary">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5 shrink-0 text-text-tertiary">
    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden className={clsx('w-5 h-5 shrink-0', className ?? 'text-text-tertiary')}>
    <path d="M17.5 17.5l-3.889-3.889M15.278 9.028a6.25 6.25 0 1 1-12.5 0 6.25 6.25 0 0 1 12.5 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PersonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden className={clsx('w-5 h-5 shrink-0', className ?? 'text-text-tertiary')}>
    <path d="M10 10a3.75 3.75 0 1 0 0-7.5A3.75 3.75 0 0 0 10 10ZM2.5 17.5a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HelpIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4 shrink-0 text-text-tertiary">
    <path d="M6 6a2 2 0 1 1 2.667 1.886C8.27 8.06 8 8.416 8 8.8V9.5M8 11.5v.5M14.5 8A6.5 6.5 0 1 1 1.5 8a6.5 6.5 0 0 1 13 0Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Figma: check-line — 20px, color driven by parent text class
const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden className={clsx('w-5 h-5 shrink-0', className ?? 'text-primary-text')}>
    <path d="M4.167 10.416l4.166 4.167 7.5-8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseSmIcon = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-black/10 transition-colors shrink-0"
    aria-label="Remove"
  >
    <svg viewBox="0 0 14 14" fill="none" aria-hidden className="w-2.5 h-2.5">
      <path d="M10.5 3.5l-7 7M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </button>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const AvatarCircle = ({ avatar, size = 20 }: { avatar: DropdownAvatar; size?: number }) => (
  <div
    className="rounded-full bg-background-secondary overflow-hidden shrink-0 relative"
    style={{ width: size, height: size }}
  >
    {avatar.src ? (
      <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
    ) : (
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-text-secondary">
        {avatar.name.charAt(0).toUpperCase()}
      </span>
    )}
  </div>
);

// ─── MenuItem ─────────────────────────────────────────────────────────────────
// Figma: outer px-2 py-[2px], inner p-2 rounded-md
// States: Default (no bg), Hover (bg-neutral-p90), Selected (bg-neutral-p90 + check)
// Disabled: muted text, no interaction

interface MenuItemProps {
  opt: DropdownOption;
  isSelected: boolean;
  isMulti: boolean;
  onSelect: () => void;
}

const MenuItem = ({ opt, isSelected, isMulti, onSelect }: MenuItemProps) => {
  const itemType = opt.itemType ?? 'default';
  const isDisabled = opt.disabled;

  const leadingEl: ReactNode = (() => {
    if (itemType === 'icon-leading') return opt.icon ?? <PersonIcon className={isDisabled ? 'text-text-disabled' : 'text-text-tertiary'} />;
    if (itemType === 'avatar-leading' && opt.avatar) return <AvatarCircle avatar={opt.avatar} size={24} />;
    if (itemType === 'dot-leading') return (
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: isDisabled ? '#BDC3CD' : (opt.dotColor ?? '#9DA6B5') }}
      />
    );
    return null;
  })();

  return (
    // Figma outer wrapper: px-2 py-[2px]
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      onClick={isDisabled ? undefined : onSelect}
      className={clsx('px-2 py-[2px]', isDisabled ? 'cursor-not-allowed' : 'cursor-pointer')}
    >
      {/* Figma inner content: p-2 rounded-md */}
      <div
        className={clsx(
          'flex items-center gap-2 p-2 rounded-md transition-colors',
          isSelected && !isDisabled && 'bg-neutral-p90',
          !isSelected && !isDisabled && 'hover:bg-neutral-p90',
          isDisabled && 'opacity-60',
        )}
      >
        {/* Leading */}
        {leadingEl}

        {/* Label + supporting text */}
        <span className={clsx(
          'flex-1 min-w-0 text-base leading-6 flex items-center gap-2',
          isDisabled ? 'text-text-disabled' : 'text-text-secondary',
        )}>
          <span className="truncate">{opt.label}</span>
          {opt.supportingText && (
            <span className={clsx(
              'text-base leading-6 shrink-0',
              isDisabled ? 'text-text-disabled' : 'text-text-quinary',
            )}>
              {opt.supportingText}
            </span>
          )}
        </span>

        {/* Check icon — trailing right */}
        {isSelected && (
          <CheckIcon className={isDisabled ? 'text-text-disabled' : 'text-primary-text'} />
        )}
        {/* Multi-select: unselected shows empty space so check aligns */}
        {isMulti && !isSelected && <span className="w-5 h-5 shrink-0" />}
      </div>
    </li>
  );
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────

export const Dropdown = ({
  type = 'default',
  label,
  required = false,
  showHelpIcon = false,
  hintText,
  placeholder = 'Select item',
  disabled = false,
  value: controlledValue,
  defaultValue,
  onChange,
  values: controlledValues,
  defaultValues,
  onChangeMulti,
  options = [],
  icon,
  avatar,
  open: controlledOpen,
  onOpenChange,
  className,
}: DropdownProps) => {
  const isMulti  = type === 'multi-select';
  const hasSearch = type === 'search' || isMulti;
  const labelId   = useId();
  const triggerId = useId();
  const listboxId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef   = useRef<HTMLDivElement>(null);

  // ── Open state ─────────────────────────────────────────────────────────────
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = useCallback((next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, onOpenChange]);

  // ── Single-select value ────────────────────────────────────────────────────
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const singleValue = controlledValue !== undefined ? controlledValue : internalValue;

  // ── Multi-select values ────────────────────────────────────────────────────
  const [internalValues, setInternalValues] = useState<string[]>(defaultValues ?? []);
  const multiValues = controlledValues !== undefined ? controlledValues : internalValues;

  // ── Search filter ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = (hasSearch && searchQuery)
    ? options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, setOpen]);

  // ── Focus search on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && hasSearch) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
    if (!isOpen) setSearchQuery('');
  }, [isOpen, hasSearch]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTriggerClick = () => {
    if (disabled) return;
    setOpen(!isOpen);
  };

  const handleSelectSingle = (opt: DropdownOption) => {
    if (controlledValue === undefined) setInternalValue(opt.value);
    onChange?.(opt.value);
    setOpen(false);
  };

  const handleSelectMulti = (opt: DropdownOption) => {
    const next = multiValues.includes(opt.value)
      ? multiValues.filter(v => v !== opt.value)
      : [...multiValues, opt.value];
    if (controlledValues === undefined) setInternalValues(next);
    onChangeMulti?.(next);
  };

  const handleRemoveChip = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = multiValues.filter(v => v !== val);
    if (controlledValues === undefined) setInternalValues(next);
    onChangeMulti?.(next);
  };

  // ── Derived display ────────────────────────────────────────────────────────
  const selectedLabel  = options.find(o => o.value === singleValue)?.label ?? '';
  const hasSelection   = isMulti ? multiValues.length > 0 : !!selectedLabel;

  // ── Trigger leading element ────────────────────────────────────────────────
  const triggerLeading: ReactNode = (() => {
    if (type === 'search' || type === 'multi-select') return <SearchIcon />;
    if (type === 'icon-leading') return icon ?? <PersonIcon />;
    if (type === 'avatar-leading') return avatar ? <AvatarCircle avatar={avatar} size={20} /> : <PersonIcon />;
    return null;
  })();

  return (
    <div ref={rootRef} className={clsx('flex flex-col gap-2 w-full', className)}>

      {/* ── Label row ───────────────────────────────────────────────────────── */}
      {(label || showHelpIcon) && (
        <div className="flex gap-1 items-center" id={labelId}>
          {label && (
            <label htmlFor={triggerId} className="text-sm text-text-secondary leading-5 whitespace-nowrap">
              {label}
            </label>
          )}
          {required && (
            <span className="text-sm text-error leading-5" aria-hidden>*</span>
          )}
          {showHelpIcon && <HelpIcon />}
        </div>
      )}

      {/* ── Trigger + Panel (relative wrapper so panel is 8px below trigger) ── */}
      <div className="relative">

      {/* ── Trigger button ──────────────────────────────────────────────────── */}
      {/* Figma: border rounded-md (8px), px-3 py-2, border-neutral-p80 */}
      <button
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        disabled={disabled}
        onClick={handleTriggerClick}
        className={clsx(
          'flex items-center gap-2 w-full px-3 py-2 rounded-md border text-left transition-colors',
          isOpen
            ? 'border-primary-text ring-1 ring-primary-text/20 outline-none'
            : 'border-neutral-p80 hover:border-neutral-p60',
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none bg-neutral-p95',
        )}
      >
        {/* Leading element */}
        {triggerLeading}

        {/* Value display area */}
        {isMulti ? (
          <div className="flex flex-wrap flex-1 min-w-0 gap-1 items-center">
            {multiValues.length > 0 ? (
              multiValues.map(val => {
                const opt = options.find(o => o.value === val);
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-p90 text-xs text-text-secondary"
                  >
                    {opt?.label ?? val}
                    <CloseSmIcon onClick={(e) => handleRemoveChip(val, e)} />
                  </span>
                );
              })
            ) : (
              <span className="text-base text-text-placeholder leading-6">
                {placeholder}
              </span>
            )}
          </div>
        ) : (
          <span className={clsx(
            'flex-1 min-w-0 text-base leading-6 truncate text-left',
            hasSelection ? 'text-text-primary' : 'text-text-placeholder',
          )}>
            {hasSelection ? selectedLabel : placeholder}
          </span>
        )}

        {/* Trailing chevron */}
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────────────── */}
      {/* Figma: mt-2 (8px gap from trigger), rounded-md border border-neutral-p80 shadow */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable={isMulti}
          aria-labelledby={label ? labelId : undefined}
          className="absolute z-50 top-full mt-2 w-full bg-white rounded-md border border-neutral-p80 shadow-lg overflow-hidden"
        >
          {/* Search input inside panel */}
          {hasSearch && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-p80">
              <SearchIcon className="text-text-tertiary" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 text-sm text-text-primary placeholder:text-text-placeholder bg-transparent outline-none leading-5"
              />
            </div>
          )}

          {/* Options list */}
          {/* Figma panel inner: py-1 top/bottom padding */}
          <ul className="py-1 max-h-60 overflow-y-auto" role="presentation">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-sm text-text-quaternary">No options</li>
            ) : (
              filteredOptions.map(opt => (
                <MenuItem
                  key={opt.value}
                  opt={opt}
                  isSelected={isMulti ? multiValues.includes(opt.value) : singleValue === opt.value}
                  isMulti={isMulti}
                  onSelect={() => isMulti ? handleSelectMulti(opt) : handleSelectSingle(opt)}
                />
              ))
            )}
          </ul>
        </div>
      )}

      </div>{/* end trigger+panel wrapper */}

      {/* ── Hint text ───────────────────────────────────────────────────────── */}
      {hintText && (
        <p className="text-sm text-text-quaternary leading-5">{hintText}</p>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';
