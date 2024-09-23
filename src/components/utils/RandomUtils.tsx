export const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * Math.floor(max));
}

const availableColors = [
    "magenta",
    "red",
    "volcano",
    "orange",
    "gold",
    "lime",
    "green",
    "cyan",
    "blue",
    "geekblue",
    "purple",
];

export const randomColor = (): string => {
    return availableColors[getRandomInt(availableColors.length)]
};