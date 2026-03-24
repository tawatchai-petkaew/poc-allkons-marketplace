'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  GoogleMap,
  Marker,
  OverlayView,
  useJsApiLoader,
} from '@react-google-maps/api';

import Typography from '@/components/Typography';
import Button from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';
import Image from 'next/image';
import TypographyHighlightText from '@/components/Typography/HighlightText';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import SectionIcon from '@/components/Sections/SectionIcon';
import { Grid } from 'antd';
import { useNotification } from '@/hooks/notification.hook';

type AddressParts = {
  route: string; // ถนน
  sublocality: string; // แขวง/ตำบล
  district: string; // เขต/อำเภอ
  province: string; // จังหวัด
  postalCode: string; // รหัสไปรษณีย์
  country: string;
};

type PickedLocation = {
  lat: number;
  lng: number;
  placeName: string; // ชื่อสถานที่ (ถ้าได้)
  formattedAddress: string; // ที่อยู่รวม
  parts: AddressParts;
  placeId?: string;
};

type Comp = { long_name: string; short_name: string; types: string[] };

const libraries: 'places'[] = ['places'];
type SavedAddress = PickedLocation & { id: string; createdAt: string };
const SAVED_ADDRESSES_KEY = 'saved_addresses_v1';

function safeStr(v?: string) {
  const s = (v ?? '').trim();
  return s.length ? s : '-';
}

function getComp(
  comps: google.maps.GeocoderAddressComponent[],
  type: string,
  useShort = false
) {
  const c = comps.find((x) => x.types.includes(type));
  if (!c) return undefined;
  return useShort ? c.short_name : c.long_name;
}

function findComp(comps: Comp[], type: string) {
  return comps.find((c) => c.types.includes(type));
}

function getLong(comps: Comp[], type: string) {
  return findComp(comps, type)?.long_name;
}

function normalizeBangkokProvince(province?: string) {
  if (!province) return province;
  const p = province.toLowerCase();
  if (p.includes('krung thep') || p.includes('bangkok')) return 'กรุงเทพมหานคร';
  if (province.includes('กรุงเทพ')) return 'กรุงเทพมหานคร';
  return province;
}

function isBangkokByComponents(comps: Comp[]) {
  const prov = (
    getLong(comps, 'administrative_area_level_1') ?? ''
  ).toLowerCase();
  // รองรับ EN/TH
  return (
    prov.includes('krung thep') ||
    prov.includes('bangkok') ||
    prov.includes('กรุงเทพ')
  );
}

function stripPrefix(name: string) {
  return (
    name
      // EN
      .replace(/^Khet\s+/i, '')
      .replace(/^Khwaeng\s+/i, '')
      .replace(/^Amphoe\s+/i, '')
      .replace(/^Tambon\s+/i, '')
      .replace(/^Chang Wat\s+/i, '')
      // TH
      .replace(/^เขต\s+/i, '')
      .replace(/^แขวง\s+/i, '')
      .replace(/^อำเภอ\s+/i, '')
      .replace(/^ตำบล\s+/i, '')
      .replace(/^จังหวัด\s+/i, '')
      .trim()
  );
}

/**
 * Robust parser + FIX กทม: ใส่ route ให้กรุงเทพด้วย
 */
function extractAddressPartsRobustFromGeocoder(
  result: google.maps.GeocoderResult
): AddressParts {
  const comps = result.address_components ?? [];
  const isBkk = isBangkokByComponents(comps as unknown as Comp[]);

  let district: string | undefined;
  let sublocality: string | undefined;
  let route: string | undefined;
  let province: string | undefined;

  if (isBkk) {
    route =
      getComp(comps, 'route') ||
      getComp(comps, 'point_of_interest') ||
      getComp(comps, 'premise') ||
      getComp(comps, 'establishment');

    const khet = getLong(comps as unknown as Comp[], 'sublocality_level_1');
    const khwaeng = getLong(comps as unknown as Comp[], 'sublocality_level_2');

    const provinceRaw =
      getLong(comps as unknown as Comp[], 'administrative_area_level_1') ||
      getLong(comps as unknown as Comp[], 'administrative_area_level_2') ||
      getComp(comps, 'administrative_area_level_1') ||
      getComp(comps, 'administrative_area_level_2');

    province = safeStr(normalizeBangkokProvince(provinceRaw));

    district = safeStr(khet ? stripPrefix(khet) : undefined);
    sublocality = safeStr(khwaeng ? stripPrefix(khwaeng) : undefined);

    // fallback เผื่อผลลัพธ์บางชุดสลับ/ขาด
    if (district === '-') {
      const alt =
        getLong(comps as unknown as Comp[], 'administrative_area_level_2') ||
        getLong(comps as unknown as Comp[], 'administrative_area_level_3') ||
        getLong(comps as unknown as Comp[], 'locality') ||
        getComp(comps, 'administrative_area_level_2') ||
        getComp(comps, 'administrative_area_level_3') ||
        getComp(comps, 'locality');
      district = safeStr(alt ? stripPrefix(alt) : undefined);
    }
    if (sublocality === '-') {
      const alt =
        getLong(comps as unknown as Comp[], 'sublocality') ||
        getLong(comps as unknown as Comp[], 'neighborhood') ||
        getLong(comps as unknown as Comp[], 'locality') ||
        getComp(comps, 'sublocality') ||
        getComp(comps, 'neighborhood') ||
        getComp(comps, 'locality');
      sublocality = safeStr(alt ? stripPrefix(alt) : undefined);
    }
  } else {
    route =
      getComp(comps, 'route') ||
      getComp(comps, 'point_of_interest') ||
      getComp(comps, 'premise') ||
      getComp(comps, 'establishment');

    // แขวง/ตำบล
    sublocality =
      getComp(comps, 'sublocality_level_1') ||
      getComp(comps, 'sublocality_level_2') ||
      getComp(comps, 'sublocality') ||
      getComp(comps, 'neighborhood') ||
      getComp(comps, 'locality') ||
      getComp(comps, 'administrative_area_level_3') ||
      getComp(comps, 'political');

    // เขต/อำเภอ
    district =
      getComp(comps, 'administrative_area_level_2') ||
      getComp(comps, 'administrative_area_level_3') ||
      getComp(comps, 'locality');

    province =
      getComp(comps, 'administrative_area_level_1') ||
      getComp(comps, 'administrative_area_level_2');
  }

  const postalCode = getComp(comps, 'postal_code');
  const country = getComp(comps, 'country');

  return {
    route: safeStr(route),
    sublocality: safeStr(sublocality ? stripPrefix(sublocality) : undefined),
    district: safeStr(district ? stripPrefix(district) : undefined),
    province: safeStr(
      province ? normalizeBangkokProvince(province) : undefined
    ),
    postalCode: safeStr(postalCode),
    country: safeStr(country),
  };
}

function scoreGeocoderResult(r: google.maps.GeocoderResult): number {
  const types = new Set(r.types);
  const priority: Array<[string, number]> = [
    ['street_address', 100],
    ['premise', 90],
    ['subpremise', 85],
    ['route', 70],
    ['intersection', 65],
    ['neighborhood', 55],
    ['sublocality', 50],
    ['locality', 45],
    ['postal_code', 40],
    ['administrative_area_level_2', 35],
    ['administrative_area_level_1', 30],
    ['country', 10],
  ];

  let s = 0;
  for (const [t, w] of priority) if (types.has(t)) s += w;
  s += Math.min(r.address_components?.length ?? 0, 12);
  return s;
}

function pickBestGeocodeResult(results: google.maps.GeocoderResult[]) {
  if (!results?.length) return null;
  return [...results].sort(
    (a, b) => scoreGeocoderResult(b) - scoreGeocoderResult(a)
  )[0];
}

async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{
  formattedAddress: string;
  parts: AddressParts;
  placeId?: string;
}> {
  const geocoder = new google.maps.Geocoder();
  const res = await geocoder.geocode({ location: { lat, lng } });

  const best = pickBestGeocodeResult(res.results);
  if (!best) {
    return {
      formattedAddress: '-',
      parts: {
        route: '-',
        sublocality: '-',
        district: '-',
        province: '-',
        postalCode: '-',
        country: '-',
      },
    };
  }

  return {
    formattedAddress: safeStr(best.formatted_address),
    parts: extractAddressPartsRobustFromGeocoder(best),
    placeId: best.place_id,
  };
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 250) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default function GoogleMapComponent({
  onClose,
}: {
  onClose: () => void;
}) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const { notification } = useNotification();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
    language: 'th',
    region: 'TH',
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  // ✅ Google Places Services (ของจริง)
  const acSvcRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placeSvcRef = useRef<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // custom autocomplete UI
  type PredictionItem = google.maps.places.AutocompletePrediction;
  const [searchValue, setSearchValue] = useState('');
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingPred, setLoadingPred] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const defaultCenter = useMemo(() => ({ lat: 13.764934, lng: 100.5383 }), []); // อนุเสาวรีชัย
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const blockMapInteraction = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    if (!acSvcRef.current)
      acSvcRef.current = new google.maps.places.AutocompleteService();
    if (!placeSvcRef.current)
      placeSvcRef.current = new google.maps.places.PlacesService(map);
    if (!sessionTokenRef.current) {
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    }
  }, []);

  const panTo = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.panTo({ lat, lng });
    map.setZoom(16);
  }, []);

  const setPickedAndHydrate = useCallback(
    async (base: {
      lat: number;
      lng: number;
      placeName?: string;
      placeId?: string;
      formattedAddress?: string;
    }) => {
      setLoadingDetails(true);
      try {
        // ตั้งหมุดก่อน เพื่อให้ user เห็นทันที
        setPicked({
          lat: base.lat,
          lng: base.lng,
          placeName: safeStr(base.placeName),
          formattedAddress: safeStr(base.formattedAddress),
          parts: {
            route: '-',
            sublocality: '-',
            district: '-',
            province: '-',
            postalCode: '-',
            country: '-',
          },
          placeId: base.placeId,
        });

        const extra = await reverseGeocode(base.lat, base.lng);

        setPicked((prev) => {
          const name =
            safeStr(prev?.placeName) !== '-'
              ? prev!.placeName
              : safeStr(base.placeName);

          const formatted =
            safeStr(prev?.formattedAddress) !== '-'
              ? prev!.formattedAddress
              : safeStr(base.formattedAddress);

          return {
            lat: base.lat,
            lng: base.lng,
            placeName: name,
            formattedAddress:
              formatted !== '-' ? formatted : extra.formattedAddress,
            parts: extra.parts,
            placeId: prev?.placeId ?? base.placeId ?? extra.placeId,
          };
        });
      } finally {
        setLoadingDetails(false);
      }
    },
    []
  );

  const onMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      await setPickedAndHydrate({ lat, lng });
      setOpen(false);
    },
    [setPickedAndHydrate]
  );

  const onMarkerDragEnd = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      await setPickedAndHydrate({
        lat,
        lng,
        placeName:
          picked?.placeName && picked.placeName !== '-'
            ? picked.placeName
            : undefined,
        placeId: picked?.placeId,
      });
    },
    [picked?.placeId, picked?.placeName, setPickedAndHydrate]
  );

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const onDown = (ev: MouseEvent) => {
      const el = wrapperRef.current;
      if (!el) return;
      if (!el.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // เพิ่มที่อยู่ปัจจุบันเมื่อเปิด map (fallback ไป Victory Monument หากต้องใช้ค่าเริ่มต้น)
  useEffect(() => {
    if (!isLoaded || picked || !initializing) return;

    let cancelled = false;

    const markInitialized = () => {
      if (!cancelled) setInitializing(false);
    };

    const hydrateFrom = async (coords: {
      lat: number;
      lng: number;
      placeName?: string;
    }) => {
      try {
        await setPickedAndHydrate(coords);
      } finally {
        markInitialized();
      }
    };

    const hydrateDefaultLocation = () =>
      hydrateFrom({
        lat: defaultCenter.lat,
        lng: defaultCenter.lng,
        placeName: 'อนุสาวรีย์ชัยสมรภูมิ',
      });

    if (!navigator.geolocation) {
      hydrateDefaultLocation();
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) return;
        await hydrateFrom({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          placeName: '-',
        });
      },
      async (error) => {
        console.log('Geolocation error:', error);
        if (cancelled) return;
        await hydrateDefaultLocation();
      }
    );

    return () => {
      cancelled = true;
    };
  }, [defaultCenter, initializing, isLoaded, picked, setPickedAndHydrate]);

  // ดึง predictions (debounce)
  const fetchPredictions = useMemo(
    () =>
      debounce((text: string) => {
        const svc = acSvcRef.current;
        const token = sessionTokenRef.current;

        if (!svc || !text.trim()) {
          setPredictions([]);
          setOpen(false);
          setLoadingPred(false);
          return;
        }

        setLoadingPred(true);

        svc.getPlacePredictions(
          {
            input: text,
            componentRestrictions: { country: 'th' },
            sessionToken: token ?? undefined,
            // types: ['address'], // ถ้าอยากเน้นที่อยู่ล้วน ๆ
          },
          (preds, status) => {
            setLoadingPred(false);
            if (
              status !== google.maps.places.PlacesServiceStatus.OK ||
              !preds?.length
            ) {
              setPredictions([]);
              //setOpen(false);
              return;
            }
            const maxToShow = 5;
            const shown = preds.slice(0, maxToShow);
            setPredictions(shown);
            setOpen(true);
            setActiveIndex(-1);
          }
        );
      }, 250),
    []
  );

  useEffect(() => {
    fetchPredictions(searchValue);
  }, [searchValue, fetchPredictions]);

  // เลือกรายการ => getDetails => pan + hydrate
  const selectPrediction = useCallback(
    (p: google.maps.places.AutocompletePrediction) => {
      const placeSvc = placeSvcRef.current;
      if (!placeSvc) return;

      setOpen(false);
      setPredictions([]);

      placeSvc.getDetails(
        {
          placeId: p.place_id,
          sessionToken: sessionTokenRef.current ?? undefined,
          fields: [
            'geometry.location',
            'name',
            'formatted_address',
            'place_id',
          ],
        },
        async (place, status) => {
          // reset token หลังเลือก 1 ครั้ง
          sessionTokenRef.current =
            new google.maps.places.AutocompleteSessionToken();

          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !place?.geometry?.location
          ) {
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formatted = place.formatted_address || p.description;

          setSearchValue(formatted);
          panTo(lat, lng);

          await setPickedAndHydrate({
            lat,
            lng,
            placeName: place.name ?? undefined,
            formattedAddress: formatted,
            placeId: place.place_id ?? p.place_id,
          });
        }
      );
    },
    [panTo, setPickedAndHydrate]
  );

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        if (predictions.length > 0) setOpen(true);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        if (open && activeIndex >= 0 && predictions[activeIndex]) {
          e.preventDefault();
          selectPrediction(predictions[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [open, predictions, activeIndex, selectPrediction]
  );

  // marker card
  const [showPinCard, setShowPinCard] = useState(true);

  // ประวัติการใช้ตำแหน่ง
  const [listAddress, setListAddress] = useState<SavedAddress[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_ADDRESSES_KEY);
      if (!raw) {
        setListAddress([]);
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setListAddress(parsed as SavedAddress[]);
        return;
      }

      setListAddress([]);
    } catch (error) {
      console.error('Failed to load saved addresses', error);
      setListAddress([]);
    }
  }, []);

  // click บันทึกที่อยู่
  const onSaveAddress = useCallback(() => {
    if (!picked) return;

    let old: SavedAddress[] = [];
    try {
      const raw = localStorage.getItem(SAVED_ADDRESSES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          old = parsed as SavedAddress[];
        }
      }
    } catch (error) {
      console.error('Failed to parse saved addresses before saving', error);
    }

    const payload: SavedAddress = {
      ...picked,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const next = [payload, ...old];
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(next));
    setListAddress(next);
    alert('บันทึกที่อยู่แล้ว');
  }, [picked]);

  const handleSavedAddressClick = useCallback(
    (address: SavedAddress) => {
      setPicked({ ...address });
      panTo(address.lat, address.lng);
      setSearchValue(address.formattedAddress);
      setShowPinCard(true);
    },
    [panTo]
  );

  if (!apiKey || loadError || !isLoaded) {
    return (
      <>
        <TextField
          placeholder="ค้นหาสถานที่"
          focusRing={true}
          prefix={<i className="ri-search-line" />}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            if (e.target.value.length > 0) {
              setOpen(true);
            }
          }}
          onFocus={() => {
            setOpen(true);
          }}
          onKeyDown={onInputKeyDown}
          size="middle"
          disabled
        />
        <div className="w-[932px] h-[416px] flex flex-col items-center justify-center bg-white rounded-lg">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-full w-full">
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 64 }}
                    className="text-primary"
                    spin
                  />
                }
              />
            </div>
          ) : (
            <>
              <SectionIcon iconClass={'ri-information-fill'} type="default" />
              <Typography
                variant="paragraph-middle-medium"
                className="!text-text-secondary"
              >
                ขออภัยในความไม่สะดวก
              </Typography>
              <Typography
                variant="paragraph-small-regular"
                className="!text-text-quaternary"
              >
                โปรดลองใหม่อีกครั้ง ลองค้นหาด้วยคำอื่น
              </Typography>
            </>
          )}
        </div>
      </>
    );
  }

  console.log('location ', picked);

  const handleConfirm = () => {
    console.log('select location ', picked);
    localStorage.setItem('save_location', JSON.stringify(picked));
    notification.success({
      message: 'ที่อยู่ที่เลือก',
      description: picked?.formattedAddress.toString(),
    });
    onClose();
  };

  return (
    <div className="">
      <div ref={wrapperRef} className="ac-wrap relative">
        <TextField
          placeholder="ค้นหาสถานที่"
          focusRing={true}
          prefix={<i className="ri-search-line" />}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            if (e.target.value.length > 0) {
              setOpen(true);
            }
          }}
          onFocus={() => {
            setOpen(true);
          }}
          onKeyDown={onInputKeyDown}
          size="middle"
        />

        {open && searchValue.length > 0 && (
          <div className="ac-dropdown absolute top-[52px] z-[101]  max-h-[300px] flex flex-col  bg-white w-full p-5 border border-neutral-border rounded-lg shadow-lg">
            {loadingPred ? (
              <div className="flex items-center justify-center h-full w-full">
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: 24 }}
                      className="text-primary"
                      spin
                    />
                  }
                />
              </div>
            ) : (
              <>
                {predictions.length === 0 ? (
                  <div className="ac-empty flex flex-col items-center justify-center py-10 gap">
                    <Image
                      src="/assets/icons/location-map.svg"
                      alt="img-icon"
                      className="mx-auto"
                      width={160}
                      height={160}
                    />

                    <Typography
                      variant="paragraph-middle-medium"
                      className="!text-text-secondary"
                    >
                      ไม่พบผลลัพธ์ “{searchValue}”
                    </Typography>
                    <Typography
                      variant="paragraph-small-regular"
                      className="!text-text-quaternary"
                    >
                      ลองค้นหาด้วยคำอื่น
                    </Typography>
                  </div>
                ) : (
                  <>
                    <Typography variant="paragraph-middle-regular">
                      ผลลัพธ์
                    </Typography>
                    <div className="gap-y-1 flex flex-col justify-start items-start pt-4">
                      {predictions.map((p, idx) => {
                        const active = idx === activeIndex;
                        return (
                          <Button
                            key={p.place_id}
                            className={`ac-item w-full !justify-start gap ${
                              active ? 'is-active' : ''
                            }`}
                            onClick={() => selectPrediction(p)}
                            variant="ghost"
                            color="neutral"
                          >
                            <div className="bg-[#F7F8F9] w-8 h-8 flex items-center justify-center rounded-lg">
                              <i className="ri-map-pin-line " />
                            </div>
                            <TypographyHighlightText
                              variant="paragraph-middle-regular"
                              className="!line-clamp-1 w-full text-left"
                              ellipsis
                              ellipsisOptions={{ rows: 1 }}
                              searchKeyword={searchValue}
                              text={`${
                                p.structured_formatting?.main_text ??
                                p.description
                              } ${
                                p.structured_formatting?.secondary_text ?? ''
                              }`}
                            />
                          </Button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="relative mt-3 rounded-xl border border-neutral-border h-[416px] overflow-hidden z-[100] max-w-[932px] mx-auto max-h-[438px] sm:max-h-[416px]">
        <GoogleMap
          onLoad={onMapLoad}
          onClick={onMapClick}
          center={picked ? { lat: picked.lat, lng: picked.lng } : defaultCenter}
          zoom={picked ? 16 : 12}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            gestureHandling: 'greedy',
            clickableIcons: false,
            fullscreenControl: false,
            streetViewControl: false,
          }}
        >
          {picked && (
            <div className="relative">
              <Marker
                position={{ lat: picked.lat, lng: picked.lng }}
                draggable
                onDragEnd={onMarkerDragEnd}
                onClick={() => setShowPinCard(true)}
              />
              {showPinCard && (
                <OverlayView
                  position={{ lat: picked.lat, lng: picked.lng }}
                  mapPaneName={OverlayView.FLOAT_PANE}
                  getPixelPositionOffset={(w, h) => ({
                    x: -(w / 2),
                    y: -h,
                  })}
                >
                  <div
                    className="absolute bottom-[47px] left-[-120px] w-[240px] max-w-[240px] bg-white p-2 rounded-lg text-center"
                    onPointerDown={blockMapInteraction}
                    onPointerUp={blockMapInteraction}
                    onMouseDown={blockMapInteraction}
                    onMouseUp={blockMapInteraction}
                    onTouchStart={blockMapInteraction}
                    onTouchEnd={blockMapInteraction}
                    onClick={blockMapInteraction}
                  >
                    <Typography
                      variant="paragraph-extra-small-medium"
                      className="!text-text-primary"
                    >
                      สถานที่ค่าเริ่มต้น
                    </Typography>

                    <Typography
                      variant="paragraph-extra-small-regular"
                      className="!text-text-primary !mt-2"
                    >
                      {picked.formattedAddress}
                    </Typography>
                    <Button
                      className="mt-2 w-full"
                      onClick={onSaveAddress}
                      variant="outlined"
                      icon={
                        <i className="ri-add-line text-xl text-tertiary"></i>
                      }
                    >
                      บันทึกที่อยู่
                    </Button>
                  </div>
                </OverlayView>
              )}
            </div>
          )}
        </GoogleMap>
      </div>

      {listAddress.length > 0 && (
        <div className="mt-6 mb-10">
          <Typography
            variant="paragraph-middle-regular"
            className="!text-text-secondary !mb-2"
          >
            ประวัติการใช้ตำแหน่ง
          </Typography>

          <div className="flex flex-col gap-3 max-h-[230px] overflow-y-auto">
            {listAddress.map((item, i) => {
              return (
                <div
                  key={item.id ?? i}
                  className="flex  items-center justify-between px-4 py-5 border border-neutral-border rounded-xl"
                >
                  <Typography
                    variant="paragraph-middle-medium"
                    className="!text-text-secondary"
                    ellipsis
                    ellipsisOptions={{ rows: 1 }}
                  >
                    {item.formattedAddress}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleSavedAddressClick(item)}
                    className="w-9"
                  >
                    <i className="ri-add-line text-xl text-tertiary"></i>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isMobile ? (
        <div className="pt-4 fixed bottom-4 w-full inset-x-0 px-4 bg-white z-[120]">
          <Button
            color="primary"
            onClick={handleConfirm}
            icon={<i className="ri-search-line"></i>}
            fullWidth
          >
            ใช้ที่อยู่นี้
          </Button>
        </div>
      ) : (
        <div className="pt-4 pb-1 w-full sticky bottom-0 max-w-[932px] mx-auto bg-white z-[120]">
          <Button
            color="primary"
            onClick={handleConfirm}
            icon={<i className="ri-search-line"></i>}
            fullWidth
          >
            ใช้ที่อยู่นี้
          </Button>
        </div>
      )}
    </div>
  );
}
