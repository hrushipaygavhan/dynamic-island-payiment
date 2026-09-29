import ActivityKit
import SwiftUI
import WidgetKit

// Real Dynamic Island + Lock Screen UI for Orbit Pay, following the Figma frames:
// compact = [✓ Paid] island [₹240], expanded/lock screen = the big "Paid ₹240 to Vitthal Kirana" pill.

@main
struct OrbitActivityBundle: WidgetBundle {
  var body: some Widget {
    OrbitPayLiveActivity()
  }
}

private let payGreen = Color(red: 48 / 255, green: 209 / 255, blue: 88 / 255)
private let dim = Color.white.opacity(0.7)

/// Green disc with a white check (the in-app success mark, drawn natively)
struct PaidMark: View {
  let size: CGFloat
  var body: some View {
    ZStack {
      Circle().fill(payGreen)
      Image(systemName: "checkmark")
        .font(.system(size: size * 0.48, weight: .heavy))
        .foregroundColor(.white)
    }
    .frame(width: size, height: size)
  }
}

/// Static frame of the three orbits (you, bank, merchant) for the "paying" state
struct OrbitMark: View {
  let size: CGFloat
  private let rings: [(Color, Double)] = [
    (Color(red: 100 / 255, green: 210 / 255, blue: 1), 0),
    (Color(red: 191 / 255, green: 120 / 255, blue: 1), 60),
    (Color.white, 120),
  ]
  var body: some View {
    ZStack {
      ForEach(0..<3, id: \.self) { i in
        Ellipse()
          .stroke(rings[i].0.opacity(0.75), lineWidth: max(1, size * 0.04))
          .frame(width: size * 0.9, height: size * 0.36)
          .rotationEffect(.degrees(rings[i].1))
      }
      Circle().fill(Color.white).frame(width: size * 0.14, height: size * 0.14)
        .offset(x: size * 0.4)
    }
    .frame(width: size, height: size)
  }
}

struct StatusMark: View {
  let paid: Bool
  let size: CGFloat
  var body: some View {
    if paid {
      PaidMark(size: size)
    } else {
      OrbitMark(size: size)
    }
  }
}

struct OrbitPayLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: OrbitPayAttributes.self) { context in
      // Lock Screen / notification banner
      let paid = context.state.status == "paid"
      HStack(spacing: 16) {
        StatusMark(paid: paid, size: 44)
        VStack(alignment: .leading, spacing: 2) {
          Text(paid ? "PAID" : "PAYING")
            .font(.system(size: 14))
            .foregroundColor(dim)
          Text("₹\(context.state.amount) to \(context.attributes.merchant)")
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(.white)
            .lineLimit(1)
        }
        Spacer(minLength: 0)
      }
      .padding(.horizontal, 20)
      .padding(.vertical, 18)
      .activityBackgroundTint(Color.black)
      .activitySystemActionForegroundColor(Color.white)
    } dynamicIsland: { context in
      let paid = context.state.status == "paid"
      return DynamicIsland {
        // Long-press on the island
        DynamicIslandExpandedRegion(.leading) {
          StatusMark(paid: paid, size: 44)
            .padding(.leading, 6)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text("₹\(context.state.amount)")
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(.white)
            .padding(.trailing, 6)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .leading, spacing: 2) {
            Text(paid ? "PAID" : "PAYING")
              .font(.system(size: 14))
              .foregroundColor(dim)
            Text("to \(context.attributes.merchant)")
              .font(.system(size: 20, weight: .bold))
              .foregroundColor(.white)
          }
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.horizontal, 6)
        }
      } compactLeading: {
        // Figma "iPhone 17 - 7": check + "Paid" on the left of the island
        HStack(spacing: 4) {
          StatusMark(paid: paid, size: 20)
          Text(paid ? "Paid" : "Paying")
            .font(.system(size: 16, weight: .bold))
            .foregroundColor(.white)
        }
        .padding(.leading, 2)
      } compactTrailing: {
        Text("₹\(context.state.amount)")
          .font(.system(size: 16, weight: .bold))
          .foregroundColor(.white)
      } minimal: {
        StatusMark(paid: paid, size: 20)
      }
      .keylineTint(payGreen)
    }
  }
}
