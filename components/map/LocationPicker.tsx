'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, MapPin, Navigation } from 'lucide-react'
import Button from '@/components/ui/Button'

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number, address?: string) => void
}

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationChange(lat, lng)
    },
  })
  return null
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.4168, -3.7038]) // Madrid por defecto
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (latitude && longitude) {
      const pos: [number, number] = [latitude, longitude]
      setMapCenter(pos)
      setMarkerPosition(pos)
    }
  }, [latitude, longitude])

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng])
    reverseGeocode(lat, lng)
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ControlHorarioApp/1.0',
          },
        }
      )
      const data = await response.json()
      const address = data.display_name || ''
      onLocationChange(lat, lng, address)
    } catch (error) {
      console.error('Error en reverse geocoding:', error)
      onLocationChange(lat, lng)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ControlHorarioApp/1.0',
          },
        }
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        const address = result.display_name

        const pos: [number, number] = [lat, lng]
        setMapCenter(pos)
        setMarkerPosition(pos)
        onLocationChange(lat, lng, address)
        setSearchQuery('')
      } else {
        alert('No se encontró la dirección. Intenta con otra búsqueda.')
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      alert('Error al buscar la dirección')
    } finally {
      setSearching(false)
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const pos: [number, number] = [lat, lng]
        setMapCenter(pos)
        setMarkerPosition(pos)
        reverseGeocode(lat, lng)
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error)
        alert('No se pudo obtener tu ubicación. Verifica que tengas el GPS activado.')
      },
      { timeout: 10000 }
    )
  }

  return (
    <div className="space-y-4">
      {/* Buscador de direcciones */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            placeholder="Buscar dirección (ej: Calle Gran Vía, Madrid)"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          variant="primary"
        >
          {searching ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {/* Botón de usar ubicación actual */}
      <Button
        type="button"
        onClick={handleUseCurrentLocation}
        variant="outline"
        className="w-full"
      >
        <Navigation className="w-4 h-4 mr-2" />
        Usar mi ubicación actual
      </Button>

      {/* Mapa */}
      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationChange={handleMapClick} />
          {markerPosition && (
            <Marker position={markerPosition} />
          )}
        </MapContainer>
      </div>

      {/* Información de la ubicación seleccionada */}
      {markerPosition && (
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>
            {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
          </span>
        </div>
      )}
    </div>
  )
}



