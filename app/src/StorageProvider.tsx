// working around @capacitor/storage to make it more React-friendly. I should publish this as gist or smth
import { Storage } from '@capacitor/storage'
import {
	createContext,
	ReactNode,
	useState,
	useContext,
	useCallback,
} from 'react'

const initialStorage: Record<string, any> = {}

const StorageContext = createContext({
	state: initialStorage,
	setState: (newState: Record<string, any>) =>
		console.error('StorageProvider needed!'),
})

/** Run this before App is rendered */
export async function initStorage() {
	const { value } = await Storage.get({ key: 'storage' })
	const storage: Record<string, any> =
		value === null ? initialStorage : JSON.parse(value)
	;(globalThis as any).__INIT_STORAGE_TEMPORARY_IGNORE_THIS__ = storage
}

/** Wrap App with this Provider */
export function StorageProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<Record<string, any>>(
		(globalThis as any).__INIT_STORAGE_TEMPORARY_IGNORE_THIS__,
	)
	return (
		<StorageContext.Provider value={{ state, setState }}>
			{children}
		</StorageContext.Provider>
	)
}

/** Use this Hook in order to access objects in storage, defaults to fallback when key not found if provided */
export function useStorage<T>(key: string): [T | undefined, (v: T) => void]
export function useStorage<T>(key: string, fallback: T): [T, (v: T) => void]
export function useStorage<T>(key: string, fallback?: T) {
	const { state, setState } = useContext(StorageContext)
	const update = useCallback(
		(value: T) => {
			const newState = { ...state, [key]: value }
			// save every time a key is updated
			Storage.set({ key: 'storage', value: JSON.stringify(newState) })
			setState(newState)
		},
		[setState],
	)

	return [state[key] ?? fallback, update]
}
