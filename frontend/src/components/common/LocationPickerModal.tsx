import React, { useState } from 'react';
import { MapPin, Navigation, Check } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useLocation, PRESET_LOCATIONS, LocationOption } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { selectedLocation, setLocation, detectBrowserLocation, isGpsActive } = useLocation();
  const [detecting, setDetecting] = useState(false);
  const { success, error } = useToast();

  const handleSelect = (loc: LocationOption) => {
    setLocation(loc);
    success(`Location set to ${loc.area}, ${loc.city}`);
    onClose();
  };

  const handleGps = async () => {
    setDetecting(true);
    const ok = await detectBrowserLocation();
    setDetecting(false);
    if (ok) {
      success('Located nearby stores around your current GPS coordinates!');
      onClose();
    } else {
      error('Could not obtain device location. Please select your city/area manually below.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Shopping Location"
      description="Select your city or neighborhood to view accurate distances and nearby inventory."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        {/* GPS Button */}
        <Button
          variant="outline"
          className="w-full justify-between py-3 border-brand-200 bg-brand-50/40 text-brand-900 hover:bg-brand-50"
          leftIcon={<Navigation className={`w-4 h-4 text-brand-600 ${detecting ? 'animate-spin' : ''}`} />}
          onClick={handleGps}
          isLoading={detecting}
        >
          <span className="font-semibold text-xs sm:text-sm">Use Current GPS Location</span>
          {isGpsActive && <Check className="w-4 h-4 text-brand-600" />}
        </Button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="shrink-0 mx-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Popular Shopping Hubs
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Preset Locations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {PRESET_LOCATIONS.map((loc, idx) => {
            const isSelected =
              !isGpsActive &&
              selectedLocation.city === loc.city &&
              selectedLocation.area === loc.area;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(loc)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/70 text-brand-900 shadow-xs ring-1 ring-brand-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs sm:text-sm font-bold leading-tight">{loc.area}</p>
                    <p className="text-[11px] text-slate-500">{loc.city}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
