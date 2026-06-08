// Update the Telegram monitoring function to handle DEAD channels
function monitorTelegramChannels(channels) {
  // ...
  channels.forEach((channel) => {
    // Check if the channel is DEAD
    if (channel.status === 'DEAD') {
      // Attempt to retrieve data from the channel's public preview
      // If data is still unavailable, mark the channel as inactive
      // and remove it from the monitoring list
      channel.isActive = false;
    }
  });
  // ...
}

// Update the channel monitoring list to exclude inactive channels
function updateMonitoringList(channels) {
  // ...
  const activeChannels = channels.filter((channel) => channel.isActive);
  // ...
}

// Example usage:
const channels = [
  { handle: '@vxunderground', label: 'vx-underground', status: 'DEAD' },
  { handle: '@DarkfeedNews', label: 'DARKFEED', status: 'DEAD' },
  // ...
];

monitorTelegramChannels(channels);
updateMonitoringList(channels);