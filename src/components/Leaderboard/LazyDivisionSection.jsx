import { useState, useEffect, useRef, memo } from "react";
import { Box, Typography, Skeleton, Paper } from "@mui/material";
import LeaderboardTable from "./LeaderboardTable";
import { getDivisionLabel, getDivisonTimeLabel } from "../../lib/utils";

const LazyDivisionSection = memo(({ division, entries, eventId }) => {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const currentRef = containerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
        }
      },
      {
        root: null,
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Once visible, keep it rendered (don't unmount when scrolling away)
  const shouldRender = hasBeenVisible;

  return (
    <Box ref={containerRef} sx={{ width: "100%", mb: 3 }}>
      {/* Division Header - always visible */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h3">
          {getDivisionLabel(division)}
          <Typography variant="subtitle1" color="text.secondary" component="span">
            {getDivisonTimeLabel(division)}
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {entries.length} competitors
        </Typography>
      </Box>

      {/* Table - lazy loaded */}
      {shouldRender ? (
        <LeaderboardTable entries={entries} eventId={eventId} />
      ) : (
        <TablePlaceholder rowCount={Math.min(entries.length, 10)} />
      )}
    </Box>
  );
});

LazyDivisionSection.displayName = "LazyDivisionSection";

// Skeleton placeholder for the table
const TablePlaceholder = memo(({ rowCount }) => {
  return (
    <Paper elevation={2} sx={{ overflow: "hidden" }}>
      {/* Header skeleton */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          gap: 2,
        }}
      >
        <Skeleton variant="text" width={50} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={150} />
        <Skeleton variant="text" width={100} sx={{ display: { xs: "none", sm: "block" } }} />
        <Skeleton variant="text" width={120} />
        <Skeleton variant="text" width={80} />
      </Box>

      {/* Row skeletons */}
      {Array.from({ length: rowCount }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            gap: 2,
          }}
        >
          <Skeleton variant="text" width={40} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={140} />
          <Skeleton variant="text" width={90} sx={{ display: { xs: "none", sm: "block" } }} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={70} />
        </Box>
      ))}
    </Paper>
  );
});

TablePlaceholder.displayName = "TablePlaceholder";

export default LazyDivisionSection;
