import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationOption {
  city: string;
  area: string;
  lat: number;
  lng: number;
}

export const PRESET_LOCATIONS: LocationOption[] = [
  { city: 'Mumbai', area: 'Bandra', lat: 19.0607, lng: 72.8335 },
  { city: 'Mumbai', area: 'Lower Parel', lat: 18.9953, lng: 72.8258 },
  { city: 'Bengaluru', area: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { city: 'Bengaluru', area: 'Koramangala', lat: 12.9345, lng: 77.6271 },
  { city: 'Delhi', area: 'Connaught Place', lat: 28.6315, lng: 77.2195 },
  { city: 'Hyderabad', area: 'Jubilee Hills', lat: 17.4319, lng: 78.4080 },
];

interface LocationContextType {
  selectedLocation: LocationOption;
  userCoords: { lat: number; lng: number } | null;
  setLocation: (loc: LocationOption) => void;
  detectBrowserLocation: () => Promise<boolean>;
  isGpsActive: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(() => {
    const saved = localStorage.getItem('nearstyle_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return PRESET_LOCATIONS[0]; // Default to Bandra, Mumbai
  });

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
  });

  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  const setLocation = (loc: LocationOption) => {
    setSelectedLocation(loc);
    setUserCoords({ lat: loc.lat, lng: loc.lng });
    setIsGpsActive(false);
    localStorage.setItem('nearstyle_location', JSON.stringify(loc));
  };

  const detectBrowserLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setIsGpsActive(true);
          // Set friendly location label
          setSelectedLocation({
            city: 'Current Location',
            area: 'Near Me',
            lat,
            lng,
          });
          resolve(true);
        },
        () => {
          resolve(false);
        },
        { timeout: 8000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        userCoords,
        setLocation,
        detectBrowserLocation,
        isGpsActive,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
