// working around @capacitor/storage to make it more React-friendly. I should publish this as gist or smth
import { Storage } from '@capacitor/storage'
import {
	createContext,
	useState,
	useContext,
	useCallback,
	SetStateAction,
	Dispatch,
	ProviderProps,
} from 'react'

/** creates key-value pair in storage, returning Provider that should be wrapped around component & hook to use storage */
export function createKey<T>(key: string, initial?: T) {
	const { __LOAD_STORAGE_ON_INIT_IGNORE_ME__: globalStorage } = globalThis as {
		__LOAD_STORAGE_ON_INIT_IGNORE_ME__?: Record<string, T>
	}
	if (globalStorage === undefined)
		throw 'initStorage must be called before ReactDOM.render!'
	const initialValue = globalStorage[key] ?? initial

	type KeyContextData = {
		value?: T
		setValue: Dispatch<SetStateAction<T | undefined>>
	}

	const KeyContext = createContext<KeyContextData>({
		value: initialValue,
		setValue: () => {
			throw 'createKey Provider needed!'
		},
	})

	/** provider that should be wrapped around component using the storage */
	const KeyProvider = (props: Omit<ProviderProps<KeyContextData>, 'value'>) => {
		const [value, setValue] = useState(initialValue)
		return <KeyContext.Provider value={{ value, setValue }} {...props} />
	}

	/** hook to use storage */
	const useKey = () => {
		const { value, setValue } = useContext(KeyContext)

		/** save to storage without updating state, useful in some cases */
		const save = useCallback((newValue: T) => {
			globalStorage[key] = newValue
			Storage.set({ key: 'storage', value: JSON.stringify(globalStorage) })
		}, [])

		/** updates state and save to storage */
		const update = useCallback((newValue: T) => {
			setValue(newValue)
			save(newValue)
		}, [])

		return [value, update, save] as [typeof value, typeof update, typeof save]
	}

	return [KeyProvider, useKey] as [typeof KeyProvider, typeof useKey]
}

/** run this before ReactDOM.render */
export async function initStorage() {
	const { value } = await Storage.get({ key: 'storage' })
	const storage: Record<string, any> = value === null ? {} : JSON.parse(value)
	;(globalThis as any).__LOAD_STORAGE_ON_INIT_IGNORE_ME__ = storage
}
