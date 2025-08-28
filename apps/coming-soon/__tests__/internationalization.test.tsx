import { render, screen, fireEvent, waitFor } from '@testing-library/react'import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { I18nextProvider } from 'react-i18next'import { I18nextProvider } from 'react-i18next'

import { vi } from 'vitest'import { vi } from 'vitest'

import i18n from '../src/lib/i18n'import i18n from '../src/lib/i18n'

import I18nProvider, { useI18n } from '../src/contexts/I18nContext'import I18nProvider, { useI18n } from '../src/contexts/I18nContext'

import LanguageSwitcher from '../src/components/ui/LanguageSwitcher'import LanguageSwitcher from '../src/components/ui/LanguageSwitcher'



// Mock localStorage// Mock localStorage

const localStorageMock = {
  const localStorageMock = {

    getItem: vi.fn(), getItem: vi.fn(),

    setItem: vi.fn(), setItem: vi.fn(),

    removeItem: vi.fn(), removeItem: vi.fn(),

    clear: vi.fn(), clear: vi.fn(),

  }
}

Object.defineProperty(window, 'localStorage', {
  getItem: vi.fn(),

  value: localStorageMock  setItem: vi.fn(),

})  removeItem: vi.fn(),

  clear: vi.fn(),

    // Test component to access useI18n hook}

    function TestComponent() {
      Object.defineProperty(window, 'localStorage', {

        const { t, language, changeLanguage } = useI18n()  value: localStorageMock

      })

      return (

        <div>// Test component to access useI18n hook

          <div data-testid="current-language">{language}</div>function TestComponent() {

            <div data-testid="translated-text">{t('hero.title')}</div>  const {t, language, changeLanguage} = useI18n()

          <button

            data-testid="change-language" return (

          onClick={() => changeLanguage(language === 'en' ? 'ro' : 'en')}    <div>

      >      <div data-testid="current-language">{language}</div>

            Change Language      <div data-testid="translated-text">{t('hero.title')}</div>

          </button>      <button 

    </div>        data - testid="change-language" 

  ) onClick = {() => changeLanguage(language === 'en' ? 'ro' : 'en')
    }

}      >

  Change Language

describe('Internationalization System', () => {      </button >

  beforeEach(() => {    </div >

    localStorageMock.getItem.mockClear()  )

  localStorageMock.setItem.mockClear()
}

  })

describe('Internationalization System', () => {

  describe('I18n Configuration', () => {
    beforeEach(() => {

      it('should initialize with English as default language', async () => {
        localStorageMock.getItem.mockClear()

        await i18n.init()    localStorageMock.setItem.mockClear()

        expect(i18n.language).toBe('en')
      })

    })

    describe('I18n Configuration', () => {

      it('should support both English and Romanian', () => {
        it('should initialize with English as default language', async () => {

          const supportedLanguages = i18n.options.supportedLngs      await i18n.init()

          expect(supportedLanguages).toContain('en')      expect(i18n.language).toBe('en')

          expect(supportedLanguages).toContain('ro')
        })

      })

      it('should support both English and Romanian', () => {

        it('should load translation resources correctly', () => {
          const supportedLanguages = i18n.options.supportedLngs

          const enResources = i18n.getResourceBundle('en', 'common')      expect(supportedLanguages).toContain('en')

          const roResources = i18n.getResourceBundle('ro', 'common')      expect(supportedLanguages).toContain('ro')

        })

        expect(enResources).toBeDefined()

        expect(roResources).toBeDefined()    it('should load translation resources correctly', () => {

          expect(enResources.hero?.title).toBeDefined()      const enResources = i18n.getResourceBundle('en', 'common')

          expect(roResources.hero?.title).toBeDefined()      const roResources = i18n.getResourceBundle('ro', 'common')

        })

      })      expect(enResources).toBeDefined()

      expect(roResources).toBeDefined()

      describe('I18n Context', () => {
        expect(enResources.hero?.title).toBeDefined()

        it('should provide translation function through context', () => {
          expect(roResources.hero?.title).toBeDefined()

          render(    })

          <I18nProvider>
      })

        < TestComponent />

        </I18nProvider > describe('I18n Context', () => {

      )    it('should provide translation function through context', () => {

          render(

            expect(screen.getByTestId('current-language').textContent).toBe('en')<I18nProvider>

      expect(screen.getByTestId('translated-text').textContent).toBe('The Future of AI Development') < TestComponent />

    })        </I18nProvider >

      )

    it('should change language when requested', async () => {

      render(expect(screen.getByTestId('current-language').textContent).toBe('en')

        < I18nProvider > expect(screen.getByTestId('translated-text').textContent).toBe('The Future of AI Development')

        < TestComponent />    })

        </I18nProvider >

      )    it('should change language when requested', async () => {

          render(

      const changeButton = screen.getByTestId('change-language')<I18nProvider>

          fireEvent.click(changeButton) < TestComponent />

        </I18nProvider >

            await waitFor(() => {      )

          expect(screen.getByTestId('current-language').textContent).toBe('ro')

          expect(screen.getByTestId('translated-text').textContent).toBe('Viitorul Dezvoltării AI')      const changeButton = screen.getByTestId('change-language')

        })      fireEvent.click(changeButton)

})

await waitFor(() => {

  it('should throw error when used outside provider', () => {
    expect(screen.getByTestId('current-language').textContent).toBe('ro')

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })        expect(screen.getByTestId('translated-text').textContent).toBe('Viitorul Dezvoltării AI')

  })

  expect(() => { })

  render(<TestComponent />)

}).toThrow('useI18n must be used within an I18nProvider')    it('should throw error when used outside provider', () => {

  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

  consoleSpy.mockRestore()

})      expect(() => {

})        render(<TestComponent />)

      }).toThrow('useI18n must be used within an I18nProvider')

describe('Language Switcher', () => {

  it('should render language switcher with current language', () => {
    consoleSpy.mockRestore()

    render(    })

    <I18nProvider>
})

  < LanguageSwitcher />

        </I18nProvider > describe('Language Switcher', () => {

      )    it('should render language switcher with current language', () => {

    render(

      const button = screen.getByRole('button')<I18nProvider>

    expect(button).toBeInTheDocument() < LanguageSwitcher />

      // Current language can be either English or Romanian based on initialization        </I18nProvider>

      expect(button).toHaveTextContent(/English|Română/)      )

    })

const button = screen.getByRole('button', { name: /limba|toggle|language/i })

it('should open dropdown when clicked', () => {
  expect(button).toBeInTheDocument()

  render(      // Current language can be either English or Romanian based on initialization

    <I18nProvider>      expect(button).toHaveTextContent(/English|Română/)

      <LanguageSwitcher />    })

    </I18nProvider>

  )    it('should open dropdown when clicked', () => {

    render(

      const toggleButton = screen.getByRole('button')<I18nProvider>

    fireEvent.click(toggleButton) < LanguageSwitcher />

        </I18nProvider >

      expect(screen.getByRole('listbox')).toBeInTheDocument()      )

  expect(screen.getByText('Română')).toBeInTheDocument()

})      const toggleButton = screen.getByRole('button', { name: /limba|toggle|language/i })

fireEvent.click(toggleButton)

it('should change language when option is selected', async () => {

  render(expect(screen.getByRole('listbox')).toBeInTheDocument()

    < I18nProvider > expect(screen.getByText('Română')).toBeInTheDocument()

    < LanguageSwitcher />    })

  < TestComponent />

        </I18nProvider > it('should change language when option is selected', async () => {

      )      render(

    <I18nProvider>

      const toggleButton = screen.getByRole('button')          <LanguageSwitcher />

      fireEvent.click(toggleButton)          <TestComponent />

    </I18nProvider>

      const romanianOption = screen.getByText('Română')      )

  fireEvent.click(romanianOption)

const toggleButton = screen.getByLabelText(/toggle/i)

await waitFor(() => {
  fireEvent.click(toggleButton)

  expect(screen.getByTestId('current-language').textContent).toBe('ro')

})      const romanianOption = screen.getByText('Română')

    }) fireEvent.click(romanianOption)



it('should close dropdown when clicked outside', () => {
  await waitFor(() => {

    render(expect(screen.getByTestId('current-language')).toHaveTextContent('ro')

      <I18nProvider>      })

  < LanguageSwitcher />    })

        </I18nProvider >

      ) it('should close dropdown when clicked outside', () => {

    render(

      const toggleButton = screen.getByRole('button')<I18nProvider>

    fireEvent.click(toggleButton) < LanguageSwitcher />

      expect(screen.getByRole('listbox')).toBeInTheDocument()        </I18nProvider >

      )

// Click outside

fireEvent.click(document.body)      const toggleButton = screen.getByLabelText(/toggle/i)

expect(screen.queryByRole('listbox')).not.toBeInTheDocument()      fireEvent.click(toggleButton)

    }) expect(screen.getByRole('listbox')).toBeInTheDocument()

  })

// Click outside

describe('Translation Keys', () => {
  fireEvent.click(document.body)

  const testTranslationKeys = [expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

      'navigation.hero',    })

'hero.title',  })

'hero.description',

  'ecosystem.title', describe('Translation Keys', () => {

    'projects.title',    const testTranslationKeys = [

      'footer.title'      'navigation.hero',

    ]      'hero.title',

      'hero.description',

      testTranslationKeys.forEach(key => {
        'ecosystem.title',

        it(`should have translation for key: ${key}`, () => {
          'projects.title',

        const enTranslation = i18n.t(key, { lng: 'en' })      'footer.title'

          const roTranslation = i18n.t(key, { lng: 'ro' })    ]



            expect(enTranslation).not.toBe(key) // Should not return the key itself    testTranslationKeys.forEach(key => {

          expect(roTranslation).not.toBe(key)      it(`should have translation for key: ${key}`, () => {

            expect(enTranslation).not.toBe(roTranslation) // Should be different        const enTranslation = i18n.t(key, { lng: 'en' })

          })        const roTranslation = i18n.t(key, { lng: 'ro' })

        })

        expect(enTranslation).not.toBe(key) // Should not return the key itself

        it('should handle interpolation correctly', () => {
          expect(roTranslation).not.toBe(key)

          const currentYear = new Date().getFullYear()        expect(enTranslation).not.toBe(roTranslation) // Should be different

          const copyright = i18n.t('footer.copyright', { year: currentYear, lng: 'en' })
        })

      })

    expect(copyright).toContain(currentYear.toString())

    expect(copyright).toContain('CODAI')    it('should handle interpolation correctly', () => {

    })      const currentYear = new Date().getFullYear()

  })      const copyright = i18n.t('footer.copyright', { year: currentYear, lng: 'en' })



describe('Language Detection', () => {
  expect(copyright).toContain(currentYear.toString())

  it('should detect language from localStorage', () => {
    expect(copyright).toContain('CODAI')

    localStorageMock.getItem.mockReturnValue('ro')
  })

})

// Reinitialize i18n to test detection

i18n.init()  describe('Language Detection', () => {

  it('should detect language from localStorage', () => {

    expect(localStorageMock.getItem).toHaveBeenCalledWith('i18nextLng')      localStorageMock.getItem.mockReturnValue('ro')

  })

  // Reinitialize i18n to test detection

  it('should save language preference to localStorage', async () => {
    i18n.init()

    await i18n.changeLanguage('ro')

    expect(localStorageMock.getItem).toHaveBeenCalledWith('i18nextLng')

    expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'ro')
  })

})

  }) it('should save language preference to localStorage', async () => {

  await i18n.changeLanguage('ro')

  describe('Accessibility', () => {

    it('should have proper ARIA attributes', () => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'ro')

      render(    })

      <I18nProvider>
  })

    < LanguageSwitcher />

        </I18nProvider > describe('Accessibility', () => {

      )    it('should have proper ARIA attributes', () => {

      render(

      const toggleButton = screen.getByRole('button')<I18nProvider>

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false') < LanguageSwitcher />

        expect(toggleButton).toHaveAttribute('aria-haspopup', 'listbox')        </I18nProvider >

      )

  fireEvent.click(toggleButton)

  expect(toggleButton).toHaveAttribute('aria-expanded', 'true')      const toggleButton = screen.getByLabelText(/toggle/i)

})      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')

expect(toggleButton).toHaveAttribute('aria-haspopup', 'listbox')

it('should have proper role attributes for dropdown', () => {

  render(fireEvent.click(toggleButton)

    < I18nProvider > expect(toggleButton).toHaveAttribute('aria-expanded', 'true')

    < LanguageSwitcher />    })

        </I18nProvider >

      ) it('should have proper role attributes for dropdown', () => {

      render(

      const toggleButton = screen.getByRole('button')<I18nProvider>

      fireEvent.click(toggleButton) < LanguageSwitcher />

        </I18nProvider >

      const dropdown = screen.getByRole('listbox')      )

expect(dropdown).toBeInTheDocument()

const toggleButton = screen.getByLabelText(/toggle/i)

const options = screen.getAllByRole('option')      fireEvent.click(toggleButton)

expect(options).toHaveLength(2)

expect(options[0]).toHaveAttribute('aria-selected')      const dropdown = screen.getByRole('listbox')

    }) expect(dropdown).toBeInTheDocument()

  })

}) const options = screen.getAllByRole('option')
expect(options).toHaveLength(2)
expect(options[0]).toHaveAttribute('aria-selected')
    })
  })
})