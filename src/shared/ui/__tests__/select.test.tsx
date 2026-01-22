import { describe, it, expect } from 'vitest'
import { render, screen } from '@/shared/test-utils'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  selectTriggerVariants,
} from '../select'

describe('Select Component', () => {
  it('should render select trigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('should support controlled value', () => {
    render(
      <Select value="option2">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should disable select when disabled prop is true', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('should apply custom className to trigger', () => {
    render(
      <Select>
        <SelectTrigger className="custom-class" data-testid="trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(screen.getByTestId('trigger')).toHaveClass('custom-class')
  })

  it('should render trigger with correct aria attributes', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-autocomplete', 'none')
  })

  it('should export SelectGroup component', () => {
    expect(SelectGroup).toBeDefined()
  })

  it('should export SelectLabel component', () => {
    expect(SelectLabel).toBeDefined()
  })

  it('should export SelectSeparator component', () => {
    expect(SelectSeparator).toBeDefined()
  })
})

describe('selectTriggerVariants', () => {
  it('should return default size class', () => {
    const classes = selectTriggerVariants()
    expect(classes).toContain('h-10')
  })

  it('should return sm size class', () => {
    const classes = selectTriggerVariants({ size: 'sm' })
    expect(classes).toContain('h-8')
    expect(classes).toContain('text-xs')
  })

  it('should return lg size class', () => {
    const classes = selectTriggerVariants({ size: 'lg' })
    expect(classes).toContain('h-11')
  })

  it('should include base classes', () => {
    const classes = selectTriggerVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('w-full')
    expect(classes).toContain('items-center')
    expect(classes).toContain('rounded-lg')
    expect(classes).toContain('border')
  })
})
