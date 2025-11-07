import { useEffect, useRef, useState } from 'react';

export function useThrottle<T>(value: T, limit: number): T {
	const [throttledValue, setThrottledValue] = useState<T>(value);
	const lastRan = useRef<number>(Date.now());

	useEffect(() => {
		const handler = setTimeout(
			() => {
				if (Date.now() - lastRan.current >= limit) {
					setThrottledValue(value);
					lastRan.current = Date.now();
				}
			},
			limit - (Date.now() - lastRan.current),
		);

		return () => {
			clearTimeout(handler);
		};
	}, [value, limit]);

	return throttledValue;
}
