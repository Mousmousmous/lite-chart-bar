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
    // Écouter l'événement beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Détecter iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    if (isIOS && isSafari && !isInStandaloneMode) {
      setShowIOSPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
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

  if (!showInstallButton) {
    return null
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