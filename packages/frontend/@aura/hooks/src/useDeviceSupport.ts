import { useEffect, useState } from 'react';

export function useDeviceSupport() {
	const [isTouchDevice, setIsTouchDevice] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkDevice = () => {
			setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
			setIsMobile(window.innerWidth < 768);
		};

		checkDevice();
		window.addEventListener('resize', checkDevice);

		return () => {
			window.removeEventListener('resize', checkDevice);
		};
	}, []);

	return { isTouchDevice, isMobile };
}
