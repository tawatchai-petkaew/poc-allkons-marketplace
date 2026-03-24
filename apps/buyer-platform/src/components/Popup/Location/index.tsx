import Typography from '@/components/Typography';
import ResponsivePopup from '../index';
import { useState } from 'react';
import CardSelection from '@/components/Card/Selection';
import GoogleMapComponent from '@/components/Map/GoogleMap';
import Button from '@/components/Button';
import { Grid } from 'antd';

type LocationPopupProps = {
  visible: boolean;
  onClose: () => void;
};

const LocationPopup: React.FC<LocationPopupProps> = ({ visible, onClose }) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const handleClose = (): void => {
    onClose();
  };
  const [activeTab, setActiveTab] = useState<'search-map' | 'get-location'>(
    'search-map'
  );
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    console.log('Selected location:', { lat, lng });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      // TODO: Handle location confirmation
      console.log('Confirmed location:', selectedLocation);
      onClose();
    }
  };

  return (
    <ResponsivePopup
      visible={visible}
      onClose={handleClose}
      modalProps={{
        width: 980,
        centered: true,
        destroyOnHidden: true,
      }}
      drawerProps={{
        height: '90%',
        destroyOnClose: true,
      }}
    >
      <div className="relative max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between pb-6">
          <div>
            <Typography variant="h4" className="!text-text-primary">
              เลือกที่อยู่จัดส่ง
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-tertiary"
            >
              ให้เราแนะนำร้านที่พร้อมจัดส่ง
            </Typography>
          </div>
          {isMobile && (
            <Button
              onClick={handleClose}
              variant="outlined"
              className="!px-0"
              color="neutral"
            >
              <i className="ri-close-line"></i>
            </Button>
          )}
        </div>
        <div className="w-full flex gap-2">
          <CardSelection
            isSelected={activeTab === 'search-map'}
            icon="ri-map-2-line"
            label="ค้นหาบนแผนที่"
            onClick={() => setActiveTab('search-map')}
          />
          <CardSelection
            isSelected={activeTab === 'get-location'}
            icon="ri-map-pin-line"
            label="ที่อยู่ในระบบ"
            onClick={() => setActiveTab('get-location')}
          />
        </div>
        {activeTab === 'search-map' && (
          <div className="mt-6 ">
            {/* <GoogleMapComponent
              onLocationSelect={handleLocationSelect}
              markerPosition={selectedLocation}
            /> */}

            <GoogleMapComponent onClose={onClose} />
          </div>
        )}
        {activeTab === 'get-location' && (
          <div className="mt-6">
            <Typography
              variant="paragraph-medium"
              className="!text-text-tertiary"
            >
              ที่อยู่ในระบบ - Coming soon
            </Typography>
          </div>
        )}
      </div>
    </ResponsivePopup>
  );
};

export default LocationPopup;
