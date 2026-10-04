import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaClock, FaRoute } from "react-icons/fa";
import { MdDeliveryDining, MdRestaurant } from "react-icons/md";

const MapAutoFit = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const validPoints = points.filter((point) => Array.isArray(point) && point.length === 2);
    if (validPoints.length === 1) map.setView(validPoints[0], 15, { animate: true });
    else if (validPoints.length > 1) map.fitBounds(validPoints, { padding: [32, 32], animate: true, maxZoom: 15 });
  }, [map, points]);
  return null;
};

const LiveOrderMap = ({ restaurantPoint, riderPoint, customerPoint, liveLabel, statusProgress }) => {
  const center = useMemo(() => [(restaurantPoint[0] + customerPoint[0]) / 2, (restaurantPoint[1] + customerPoint[1]) / 2], [customerPoint, restaurantPoint]);
  const distance = useMemo(() => {
    const rad = (value) => value * Math.PI / 180;
    const dLat = rad(customerPoint[0] - restaurantPoint[0]);
    const dLng = rad(customerPoint[1] - restaurantPoint[1]);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(restaurantPoint[0])) * Math.cos(rad(customerPoint[0])) * Math.sin(dLng / 2) ** 2;
    return (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }, [customerPoint, restaurantPoint]);
  const etaMinutes = Math.max(8, Math.round(Math.max(0, 100 - statusProgress) / 6));
  const riderIcon = useMemo(() => divIcon({
    className: "rider-map-icon",
    html: '<span class="rider-map-icon__pulse"></span><span class="rider-map-icon__body">➤</span>',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  }), []);

  return (
    <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-orange-100 sm:rounded-[2rem]">
      <style>{`.rider-map-icon{background:transparent;border:0}.rider-map-icon__body{position:absolute;inset:8px;display:grid;place-items:center;border:3px solid white;border-radius:999px;background:#f97316;color:white;font-size:24px;font-weight:900;line-height:1;box-shadow:0 5px 14px rgba(234,88,12,.4);transform:rotate(-45deg)}.rider-map-icon__pulse{position:absolute;inset:2px;border-radius:999px;border:2px solid #fb923c;animation:rider-pulse 1.8s ease-out infinite}@keyframes rider-pulse{0%{transform:scale(.7);opacity:.8}100%{transform:scale(1.35);opacity:0}}`}</style>
      <div className="border-b border-orange-400/30 bg-gradient-to-br from-[#f97316] via-[#ea580c] to-[#c2410c] px-4 py-4 text-white sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75 sm:text-xs sm:tracking-[0.2em]"><span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-300" />Live tracking</p><h3 className="mt-1 truncate text-base font-black sm:text-lg">{liveLabel}</h3></div>
          <div className="shrink-0 text-right"><p className="text-xl font-black leading-none sm:text-2xl">{etaMinutes}<span className="ml-1 text-sm font-bold">min</span></p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/70 sm:text-[10px] sm:tracking-widest">estimated arrival</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 bg-white p-3 sm:grid-cols-3 sm:gap-3 sm:p-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:rounded-[1.25rem] sm:p-3.5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs sm:tracking-[0.2em]"><MdRestaurant />Restaurant</div><p className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">Pickup point</p></div>
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 sm:rounded-[1.25rem] sm:p-3.5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-orange-600 sm:text-xs sm:tracking-[0.2em]"><FaRoute />Distance</div><p className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">Approx. {distance} km</p></div>
        <div className="col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 sm:col-span-1 sm:rounded-[1.25rem] sm:p-3.5"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 sm:text-xs sm:tracking-[0.2em]"><FaClock />ETA</div><p className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">About {etaMinutes} min</p></div>
      </div>
      <div className="h-[280px] w-full sm:h-[360px] lg:h-[420px]">
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
          <MapAutoFit points={[restaurantPoint, riderPoint, customerPoint]} />
          <TileLayer attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" subdomains="abcd" />
          <Polyline positions={[restaurantPoint, riderPoint]} pathOptions={{ color: "#ea580c", weight: 7, lineCap: "round" }} />
          <Polyline positions={[riderPoint, customerPoint]} pathOptions={{ color: "#94a3b8", weight: 5, dashArray: "8 12", lineCap: "round" }} />
          <CircleMarker center={restaurantPoint} radius={11} pathOptions={{ color: "#1d4ed8", fillColor: "#1d4ed8", fillOpacity: 1 }}><Tooltip direction="top" permanent>Restaurant</Tooltip></CircleMarker>
          <Marker position={riderPoint} icon={riderIcon}><Tooltip direction="top">Rider <MdDeliveryDining /></Tooltip></Marker>
          <CircleMarker center={customerPoint} radius={11} pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 1 }}><Tooltip direction="top" permanent>Delivery address</Tooltip></CircleMarker>
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveOrderMap;
