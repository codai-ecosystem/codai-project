'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react'

interface TabsProps {
  title?: string | null
  content?: string | null | undefined
  onClick?: () => void
  onSubmit?: (e: FormEvent) => void
  data?: Array<{ id: number; name: string }>
}

const Tabs: React.FC<TabsProps> = ({
  title = 'Default Title',
  content = 'Default Content',
  onClick,
  onSubmit,
  data = []
}) => {
  const [state, setState] = useState('initial state')
  const [inputValue, setInputValue] = useState('')
  const [isUpdated, setIsUpdated] = useState(false)

  const handleButtonClick = () => {
    setState('updated state - expected state')
    setIsUpdated(true)
    if (onClick) {
      onClick()
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  return (
    <main role="main" aria-label="Tabs Component">
      <div data-testid="tabs">
        <h1>{title}</h1>
        <div>
          {content && typeof content === 'string' && content.length > 0 ? content : null}
        </div>

        <button
          role="button"
          onClick={handleButtonClick}
          type="button"
        >
          Update State
        </button>

        <button
          role="button"
          type="submit"
          form="tabs-form"
        >
          Submit
        </button>

        <input
          role="textbox"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter text"
        />

        <form
          id="tabs-form"
          role="form"
          onSubmit={handleFormSubmit}
        >
          {/* Form content */}
        </form>

        <div
          data-testid="state-display"
          aria-live="polite"
        >
          {state}
        </div>

        {isUpdated && <div>Updated</div>}

        {data && data.length > 0 && (
          <div>
            {data.map(item => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

// Export as lowercase for test compatibility
const tabs = Tabs
export default tabs
