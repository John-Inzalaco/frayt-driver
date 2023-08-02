// import { TaskManager, BackgroundFetch } from 'expo';
// const UPDATE_AVAILABLE_MATCHES_TASK = 'update-available-matches';

// // TODO: Use this for any matches loading while app is not in focus
// BackgroundFetch.registerTaskAsync(UPDATE_AVAILABLE_MATCHES_TASK, {
// 	minimumInterval: 300,
// 	stopOnTerminate: false,
// 	startOnBoot: true
// })
//
// // Define our task for location updates
// TaskManager.defineTask(UPDATE_AVAILABLE_MATCHES_TASK, updateAvailableMatches)
//
// // Handle a location update.
// export async function updateAvailableMatches() {
// 	try {
// 		const receivedNewData = // do your background fetch here
//     	return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
// 	} catch (error) {
// 		return BackgroundFetch.Result.Failed;
// 	}
// }
