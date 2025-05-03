import regression from 'regression';

export interface WRStats {
  receiving: {
    targets: number;
    receptions: number;
    yards: number;
    touchdowns: number;
    yardsPerReception: number;
    catchRate: number;
    yac: number;
    contested_catches: number;
    drops: number;
    redZoneTargets: number;
    redZoneTouchdowns: number;
  };
  rushing: {
    attempts: number;
    yards: number;
    touchdowns: number;
  };
  usage: {
    snapPercentage: number;
    routeParticipation: number;
    targetShare: number;
    redZoneShare: number;
  };
  efficiency: {
    yardsPerTarget: number;
    yardsPerRoute: number;
    catchableTargetRate: number;
    dropRate: number;
  };
}

export interface WRAttributes {
  speed: number;
  hands: number;
  route: number;
  separation: number;
  yacAbility: number;
  contested: number;
  redZone: number;
  versatility: number;
}

export class WideReceiverProcessor {
  processStats(stats: Record<string, number>): {
    stats: WRStats;
    attributes: WRAttributes;
    trends: {
      receptions: number[];
      yards: number[];
      touchdowns: number[];
      targetShare: number[];
    };
  } {
    // Process receiving stats
    const receiving = {
      targets: stats.targets || 0,
      receptions: stats.rec || 0,
      yards: stats.rec_yd || 0,
      touchdowns: stats.rec_td || 0,
      yardsPerReception: stats.rec_yd / Math.max(stats.rec || 1, 1),
      catchRate: (stats.rec || 0) / Math.max(stats.targets || 1, 1) * 100,
      yac: stats.rec_yac || 0,
      contested_catches: stats.contested_catches || 0,
      drops: stats.drops || 0,
      redZoneTargets: stats.rz_tgt || 0,
      redZoneTouchdowns: stats.rz_td || 0
    };

    // Process rushing stats
    const rushing = {
      attempts: stats.rush_att || 0,
      yards: stats.rush_yd || 0,
      touchdowns: stats.rush_td || 0
    };

    // Process usage stats
    const usage = {
      snapPercentage: stats.snap_pct || 0,
      routeParticipation: stats.route_part || 0,
      targetShare: stats.tgt_share || 0,
      redZoneShare: stats.rz_share || 0
    };

    // Calculate efficiency metrics
    const efficiency = {
      yardsPerTarget: receiving.yards / Math.max(receiving.targets, 1),
      yardsPerRoute: receiving.yards / Math.max(stats.routes || 1, 1),
      catchableTargetRate: (stats.catchable_tgt || 0) / Math.max(receiving.targets, 1) * 100,
      dropRate: receiving.drops / Math.max(receiving.targets, 1) * 100
    };

    // Calculate attributes
    const attributes = this.calculateAttributes({
      ...receiving,
      ...rushing,
      ...usage,
      ...efficiency
    });

    // Calculate trends
    const trends = this.calculateTrends(stats);

    return {
      stats: {
        receiving,
        rushing,
        usage,
        efficiency
      },
      attributes,
      trends
    };
  }

  calculateAttributes(stats: Record<string, number>): WRAttributes {
    return {
      speed: Math.min(99, Math.round(75 + this.calculateSpeedRating(stats))),
      hands: Math.min(99, Math.round(75 + this.calculateHandsRating(stats))),
      route: Math.min(99, Math.round(75 + this.calculateRouteRating(stats))),
      separation: Math.min(99, Math.round(75 + this.calculateSeparationRating(stats))),
      yacAbility: Math.min(99, Math.round(75 + this.calculateYACRating(stats))),
      contested: Math.min(99, Math.round(75 + this.calculateContestedRating(stats))),
      redZone: Math.min(99, Math.round(75 + this.calculateRedZoneRating(stats))),
      versatility: Math.min(99, Math.round(75 + this.calculateVersatilityRating(stats)))
    };
  }

  private calculateSpeedRating(stats: Record<string, number>): number {
    const ypr = stats.rec_yd / Math.max(stats.rec || 1, 1);
    const explosive = stats.rec_20p || 0;
    return ((ypr - 10) * 2) + (explosive * 3);
  }

  private calculateHandsRating(stats: Record<string, number>): number {
    const catchRate = (stats.rec || 0) / Math.max(stats.targets || 1, 1) * 100;
    const dropRate = (stats.drops || 0) / Math.max(stats.targets || 1, 1) * 100;
    return (catchRate - 60) * 0.5 - (dropRate * 2);
  }

  private calculateRouteRating(stats: Record<string, number>): number {
    const routeWinRate = stats.route_win_rate || 0;
    const separation = stats.separation || 0;
    return (routeWinRate * 50) + (separation * 25);
  }

  private calculateSeparationRating(stats: Record<string, number>): number {
    const separation = stats.separation || 0;
    const targetShare = stats.tgt_share || 0;
    return (separation * 40) + (targetShare * 30);
  }

  private calculateYACRating(stats: Record<string, number>): number {
    const yac = stats.rec_yac || 0;
    const brokenTackles = stats.broken_tackles || 0;
    return (yac / 100) + (brokenTackles * 3);
  }

  private calculateContestedRating(stats: Record<string, number>): number {
    const contestedCatches = stats.contested_catches || 0;
    const contestedRate = stats.contested_catch_rate || 0;
    return (contestedCatches * 2) + (contestedRate * 0.5);
  }

  private calculateRedZoneRating(stats: Record<string, number>): number {
    const rzTD = stats.rz_td || 0;
    const rzTargets = stats.rz_tgt || 0;
    return (rzTD * 5) + ((rzTD / Math.max(rzTargets, 1)) * 50);
  }

  private calculateVersatilityRating(stats: Record<string, number>): number {
    const rushYards = stats.rush_yd || 0;
    const rushTD = stats.rush_td || 0;
    const alignments = stats.alignments || 0;
    return (rushYards / 50) + (rushTD * 5) + (alignments * 2);
  }

  private calculateTrends(stats: Record<string, number>) {
    // Get weekly stats arrays (assuming stats are stored with week_ prefix)
    const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
    
    const receptions = weeks.map(week => stats['week_' + week + '_rec'] || 0);
    const yards = weeks.map(week => stats['week_' + week + '_rec_yd'] || 0);
    const touchdowns = weeks.map(week => stats['week_' + week + '_rec_td'] || 0);
    const targetShare = weeks.map(week => stats['week_' + week + '_tgt_share'] || 0);

    return {
      receptions,
      yards,
      touchdowns,
      targetShare
    };
  }
}