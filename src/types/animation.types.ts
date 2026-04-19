export type FormContainerType = {
  hidden: { opacity: number; y: number };
  show: {
    opacity: number;
    y: number;
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
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  transition: { delay: number; duration: number };
};

export const formContainer: FormContainerType = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const inputItem: InputItemType = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
};

export const shakeError = {
  idle: {
    x: 0,
  },
  shake: {
    x: [-3, 3, -3, 2, 0],
    transition: { duration: 0.36 },
  },
};

export const textmotion: TextMotionType = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.2, duration: 0.45 },
};

export const buttonVariants = {
  whileTap: {
    scale: 0.97,
  },
  whileHover: {
    scale: 1.02,
  },
};
