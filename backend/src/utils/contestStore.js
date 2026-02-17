let contests = [];

export function setContests(data) {
  contests = data.sort((a, b) => a.startTime - b.startTime);
}

export function getContests() {
  return contests;
}
