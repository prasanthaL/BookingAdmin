export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  bookingId?: string;
};

export const initialActionState: ActionState = {
  success: false,
  message: "",
};
