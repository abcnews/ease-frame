export const millisecondsToSeconds = (milliseconds: number) => milliseconds / 1000;

export const secondsToMilliseconds = (seconds: number) => Math.floor(seconds * 1000);

const padToThreeZeroes = (value: number) => String(value).padStart(3, '0');

export const formatMillisecondsAsSecondsAndMilliseconds = (milliseconds: number): string => {
  const wholeSeconds = Math.floor(milliseconds / 1000);
  const remainderMilliseconds = Math.floor(milliseconds % 1000);

  return `${padToThreeZeroes(wholeSeconds)}:${padToThreeZeroes(remainderMilliseconds)}`;
};

const comparatorNumericAscending = (a: number, b: number) => a - b;

export const sortedNumericAscending = (iterable: Iterable<number>) => [...iterable].sort(comparatorNumericAscending);

export const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => 'touches' in event;

export const oneShotEvent = <T extends EventTarget>(target: T, name: string) => {
  return new Promise<void>(resolve => {
    const handler = () => {
      target.removeEventListener(name, handler);
      resolve();
    };

    target.addEventListener(name, handler);
  });
};
