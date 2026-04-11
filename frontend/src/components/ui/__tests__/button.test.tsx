import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../button'

describe('Button', () => {
  it('renders label and handles click interaction', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button onClick={onClick} variant="secondary">
        Save changes
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Save changes' })
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(button).toHaveClass('bg-card')
  })
})
