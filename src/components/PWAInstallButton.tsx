import { useState, useEffect } from 'react'
import { Button } from './ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  useEffect(() => {
    console.log('PWA Install Button: Component mounted')
    
    // Écouter l'événement beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Install Button: beforeinstallprompt event triggered', e)
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Détecter iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    console.log('PWA Install Button: Device detection', {
      isIOS,
      isInStandaloneMode,
      isSafari,
      userAgent: navigator.userAgent
    })
    
    if (isIOS && isSafari && !isInStandaloneMode) {
      console.log('PWA Install Button: Showing iOS prompt')
      setShowIOSPrompt(true)
    }

    // Vérifier si l'app est déjà installée
    if (isInStandaloneMode) {
      console.log('PWA Install Button: App is already installed (standalone mode)')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Vérifier après un délai si l'événement n'a pas été déclenché
    const timeout = setTimeout(() => {
      console.log('PWA Install Button: No beforeinstallprompt event after 3 seconds')
      console.log('PWA Install Button: Current state', {
        deferredPrompt: !!deferredPrompt,
        showInstallButton,
        isInStandaloneMode
      })
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timeout)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setShowInstallButton(false)
        }
        setDeferredPrompt(null)
      } catch (error) {
        console.error('Erreur lors de l\'installation:', error)
      }
    }
  }

  const dismissIOSPrompt = () => {
    setShowIOSPrompt(false)
  }

  if (showIOSPrompt) {
    return (
      <div className="fixed top-4 left-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 z-50 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">
              Installer l'application
            </p>
            <p className="text-xs text-muted-foreground">
              Appuyez sur <span className="inline-flex items-center mx-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </span> puis "Ajouter à l'écran d'accueil"
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissIOSPrompt}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </Button>
        </div>
      </div>
    )
  }

  if (!showInstallButton && !showIOSPrompt) {
    // Afficher un bouton de debug temporaire pour forcer l'affichage
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => {
            console.log('Debug: Force showing install options')
            console.log('Current state:', { showInstallButton, showIOSPrompt, deferredPrompt: !!deferredPrompt })
            // Forcer l'affichage du bouton pour debug
            setShowInstallButton(true)
          }}
          variant="outline"
          size="sm"
          className="shadow-lg backdrop-blur-sm text-xs"
        >
          🔧 Debug PWA
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        onClick={handleInstallClick}
        variant="secondary"
        size="sm"
        className="shadow-lg backdrop-blur-sm"
      >
        📱 Installer l'app
      </Button>
    </div>
  )
}

export default PWAInstallButton