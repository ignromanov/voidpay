import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { GenerateButton } from '../GenerateButton'

describe('GenerateButton', () => {
  it('calls onSubmitAttempt when clicked and canGenerate is false', async () => {
    const onSubmitAttempt = vi.fn()
    const user = userEvent.setup()

    render(
      <GenerateButton
        onGenerate={() => {}}
        canGenerate={false}
        onSubmitAttempt={onSubmitAttempt}
      />
    )

    await user.click(screen.getByRole('button'))
    expect(onSubmitAttempt).toHaveBeenCalledTimes(1)
  })

  it('calls onGenerate when clicked and canGenerate is true', async () => {
    const onGenerate = vi.fn()
    const onSubmitAttempt = vi.fn()
    const user = userEvent.setup()

    render(
      <GenerateButton
        onGenerate={onGenerate}
        canGenerate={true}
        onSubmitAttempt={onSubmitAttempt}
      />
    )

    await user.click(screen.getByRole('button'))
    expect(onGenerate).toHaveBeenCalledTimes(1)
    expect(onSubmitAttempt).not.toHaveBeenCalled()
  })
})
