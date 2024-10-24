import {createStateContext} from "react-use";

export const [useEditingStatus, EditingStatusProvider] = createStateContext(false);
export const [useSelectedLocation, SelectedLocationProvider] = createStateContext({latitude: null, longitude: null})
