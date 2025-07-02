export const getRandomParticipants = (participants, numWinners) => {
  // Randomly pick numWinners from participants array
  const winners = [];
  const shuffled = [...participants].sort(() => 0.5 - Math.random());

  for (let i = 0; i < numWinners; i++) {
    winners.push(shuffled[i]);
  }

  return winners;
};
