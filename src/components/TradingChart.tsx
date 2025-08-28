import { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'
import { IntervalButton } from './ui/interval-button'

// Types pour les données de l'API
type CandleRow = {
  time: string
  timestamp: string
  open: string
  high: string
  low: string
  close: string
}

// Configuration des intervalles
const INTERVALS = [
  { s: 60, label: "1m" },
  { s: 300, label: "5m" },
  { s: 900, label: "15m" },
  { s: 1800, label: "30m" },
  { s: 14400, label: "4h" },
]

export const TradingChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  
  const [currentInterval, setCurrentInterval] = useState(900) // Défaut 15m
  const [loadingInterval, setLoadingInterval] = useState<number | null>(null)

  // Initialisation du graphique
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Configuration du graphique avec thème dark trading
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'hsl(220, 13%, 8%)' },
        textColor: 'hsl(210, 20%, 70%)',
      },
      grid: {
        vertLines: { color: 'hsl(220, 13%, 16%)' },
        horzLines: { color: 'hsl(220, 13%, 16%)' },
      },
      crosshair: {
        mode: 1, // Normal
        vertLine: {
          color: 'hsl(210, 40%, 85%)',
          width: 1,
          style: 2, // Dashed
        },
        horzLine: {
          color: 'hsl(210, 40%, 85%)',
          width: 1,
          style: 2, // Dashed
        },
      },
      rightPriceScale: {
        borderColor: 'hsl(220, 13%, 18%)',
        textColor: 'hsl(210, 20%, 70%)',
      },
      timeScale: {
        borderColor: 'hsl(220, 13%, 18%)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    })

    // Création de la série candlestick avec la syntaxe v5.0
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(134, 61%, 41%)', // Bull green
      downColor: 'hsl(0, 84%, 60%)', // Bear red
      borderUpColor: 'hsl(134, 61%, 41%)',
      borderDownColor: 'hsl(0, 84%, 60%)',
      wickUpColor: 'hsl(134, 61%, 41%)',
      wickDownColor: 'hsl(0, 84%, 60%)',
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    // Gestion du redimensionnement
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    resizeObserverRef.current = new ResizeObserver(handleResize)
    resizeObserverRef.current.observe(chartContainerRef.current)

    // Chargement initial des données
    fetchData(currentInterval)

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      chart.remove()
    }
  }, [])

  // Fonction pour récupérer les données depuis l'API
  const fetchData = async (intervalSeconds: number) => {
    setLoadingInterval(intervalSeconds)
    
    try {
      const response = await fetch(
        `https://chart.brokex.trade/history?pair=0&interval=${intervalSeconds}`,
        { cache: "no-store" }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: CandleRow[] = await response.json()
      
      // Conversion des données pour Lightweight Charts
      const ohlc = data.map(d => ({
        time: Math.floor(Number(d.time) / 1000), // Conversion millisecondes -> secondes
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
      }))

      // Application des données à la série
      if (seriesRef.current) {
        seriesRef.current.setData(ohlc)
        
        // Ajustement de la vue pour afficher toutes les données
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoadingInterval(null)
    }
  }

  // Gestion du changement d'intervalle
  const handleIntervalChange = (intervalSeconds: number) => {
    if (intervalSeconds !== currentInterval && loadingInterval === null) {
      setCurrentInterval(intervalSeconds)
      fetchData(intervalSeconds)
    }
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Barre d'outils avec les boutons d'intervalle */}
      <div className="flex items-center justify-center gap-2 p-4 bg-card border-b border-border">
        {INTERVALS.map((interval) => (
          <IntervalButton
            key={interval.s}
            isActive={currentInterval === interval.s}
            isLoading={loadingInterval === interval.s}
            onClick={() => handleIntervalChange(interval.s)}
            className="min-w-[3rem]"
          >
            {interval.label}
          </IntervalButton>
        ))}
      </div>

      {/* Container du graphique */}
      <div 
        ref={chartContainerRef}
        className="flex-1 w-full bg-chart-background"
      />
    </div>
  )
}