export type CreateArticleRequest = {
  id: string;
  description: string;
  price: string;
  amount?: string;
};

export type UpdateArticleRequest = Partial<CreateArticleRequest>;

type FormField = { value: string; errorMessage?: string };

export type ArticleForm = {
  id: FormField;
  description: FormField;
  price: FormField;
  amount: FormField;
};
