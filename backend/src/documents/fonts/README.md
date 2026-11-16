PDF/A-3 requires the fonts used to render text to be embedded in the PDF.
PDFKit's built-in Times fonts are not embedded, so the renderer uses these local Liberation Serif files for regular and bold text instead.
Liberation Serif is designed to be metrically compatible with Times New Roman.

Liberation Serif regular and bold are from [Liberation Fonts 2.1.5](https://github.com/liberationfonts/liberation-fonts/releases/tag/2.1.5).
They are distributed under the SIL Open Font License 1.1 in the accompanying `LICENSE` file.
The Nest build copies these files alongside the PDF renderer so they are available in production.
