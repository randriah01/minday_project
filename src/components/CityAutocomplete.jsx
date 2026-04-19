import React, { useState, useRef, useEffect } from "react";
import { MADAGASCAR_CITIES } from "./MadagascarCities";
import { MapPin } from "lucide-react";

export default function CityAutocomplete({ value, onChange, placeholder, icon }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
      const filtered = MADAGASCAR_CITIES.filter((city) =>
        city.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const selectCity = (city) => {
    setQuery(city);
    onChange(city);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A520]">
          {icon || <MapPin className="w-5 h-5" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder || "Ville..."}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520] transition-all"
        />
      </div>
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {suggestions.map((city) => (
            <button
              key={city}
              onClick={() => selectCity(city)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#D4A520]/5 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D4A520]" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}