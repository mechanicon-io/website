# frozen_string_literal: true

# jekyll-favicon generates the favicon set through MiniMagick::Tool::Convert.
# On ImageMagick 7 that resolves to `magick convert …`, and IMv7 prints a
# deprecation notice for the legacy `convert` alias on every invocation
# (nine icons => nine warnings in the build log).
#
# We can't simply drop the `convert` subcommand and call `magick …` instead:
# jekyll-favicon places options such as `-flatten` *before* the input image,
# which only the legacy `convert` argument parser tolerates. The modern
# `magick` parser is strict left-to-right and errors with "no images found
# for operation `-flatten'". The `magick convert` compatibility mode exists
# precisely for this legacy ordering — the deprecation warning is the cost of
# using it, and until jekyll-favicon migrates its argument order there is no
# way to avoid the alias.
#
# So instead of changing the command, we filter the single benign deprecation
# line out of MiniMagick's captured stderr. mini_magick echoes stderr to the
# process stderr on success (Shell#run), which is where the noise comes from.
# Only this exact warning is stripped; real ImageMagick errors are untouched,
# so failures still surface (and still appear in raised error messages).
require "mini_magick"

module MiniMagickSuppressConvertDeprecation
  DEPRECATION_LINE = /^WARNING: The convert command is deprecated in IMv7.*\r?\n?/

  def execute(*)
    stdout, stderr, status = super
    [stdout, stderr.to_s.gsub(DEPRECATION_LINE, ""), status]
  end
end

MiniMagick::Shell.prepend(MiniMagickSuppressConvertDeprecation)
