export interface Anime {
  mal_id: number;
  title_english: string;
  title: string;
  searchTitle?: string;
  images: {
    jpg: {
      image_url?: string;
      large_image_url: string;
    };
  };
  score: number | null;
  synopsis: string;
  type: string;
  year?: number;
}
