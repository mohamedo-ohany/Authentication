export type FormContainerType = {
  hidden: { opacity: number };
  show: {
    opacity: number;
    transition: { staggerChildren: number };
  };
};

export type InputItemType = {
  hidden: { opacity: number; y: number };
  show: {
    opacity: number;
    y: number;
    transition: {
      type: "spring";
      stiffness: number;
      damping: number;
    };
  };
};

export type ShakeErrorType = {
  idle: { x: number };
  shake: {
    x: number[];
    transition: { duration: number };
  };
};

export type TextMotionType = {
  initial: { opacity: number; x: number };
  animate: { opacity: number; x: number };
  transition: { delay: number };
};

export const formContainer: FormContainerType = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const inputItem: InputItemType = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

export const shakeError = {
  idle: {
    x: 0,
  },
  shake: {
    x: [-2, 2, -2, 2, 0],
    transition: { duration: 0.4 },
  },
};

export const textmotion: TextMotionType = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { delay: 0.3 },
};

export const buttonVariants = {
  whileTap: {
    scale: 0.95,
  },
  whileHover: {
    scale: 1.05,
  },
};
